import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import DamLogo from '@/components/DamLogo';
import { useLanguage } from '@/contexts/LanguageContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    role: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabels = [
    t('auth.passwordWeak'),
    t('auth.passwordFair'),
    t('auth.passwordGood'),
    t('auth.passwordStrong')
  ];
  const strengthColors = ['text-destructive', 'text-yellow-500', 'text-primary', 'text-secondary'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatchError'));
      return;
    }

    if (!acceptTerms) {
      toast.error(t('auth.acceptTermsError'));
      return;
    }

    if (strength < 2) {
      toast.error(t('auth.useStrongPasswordError'));
      return;
    }

    setIsLoading(true);

    const success = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      organization: formData.organization,
      role: formData.role,
      phone: formData.phone,
    });

    if (success) {
      toast.success(t('auth.accountCreatedSuccess'));
      navigate('/dashboard');
    } else {
      toast.error(t('auth.emailExistsError'));
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="flex justify-center mb-8">
          <DamLogo size={100} showText={true} />
        </div>

        <div className="glass-card rounded-2xl p-8 border-primary/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.createYourAccount')}</h1>
            <p className="text-muted-foreground">{t('auth.joinNetwork')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.fullName')} *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="glass-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.emailAddress')} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signupEmailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="glass-card"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')} *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="glass-card pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < strength ? 'bg-current ' + strengthColors[strength - 1] : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    {strength > 0 && (
                      <p className={`text-xs ${strengthColors[strength - 1]}`}>
                        {strengthLabels[strength - 1]} {t('auth.password')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')} *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className="glass-card pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <p className="text-xs flex items-center gap-1">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check className="w-3 h-3 text-secondary" />
                        <span className="text-secondary">{t('auth.passwordsMatch')}</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-destructive" />
                        <span className="text-destructive">{t('auth.passwordsDontMatch')}</span>
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organization">{t('auth.organization')} *</Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder={t('auth.organizationPlaceholder')}
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  required
                  className="glass-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t('auth.role')} *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)} required>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder={t('auth.selectYourRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineer">{t('auth.roleEngineer')}</SelectItem>
                    <SelectItem value="Project Manager">{t('auth.roleProjectManager')}</SelectItem>
                    <SelectItem value="Safety Officer">{t('auth.roleSafetyOfficer')}</SelectItem>
                    <SelectItem value="Government Official">{t('auth.roleGovernmentOfficial')}</SelectItem>
                    <SelectItem value="Researcher">{t('auth.roleResearcher')}</SelectItem>
                    <SelectItem value="Other">{t('auth.roleOther')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('auth.phoneOptional')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="glass-card"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="emailAlerts"
                  checked={emailAlerts}
                  onCheckedChange={(checked) => setEmailAlerts(checked as boolean)}
                />
                <Label htmlFor="emailAlerts" className="text-sm cursor-pointer">
                  {t('auth.emailAlertsOptIn')}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                  {t('auth.iAcceptThe')}{' '}
                  <span className="text-primary hover:underline">{t('auth.termsAndConditions')}</span>
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
              {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6">
            {t('auth.alreadyHaveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              {t('auth.signIn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
