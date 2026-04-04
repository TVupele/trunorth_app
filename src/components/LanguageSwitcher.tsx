import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs">{currentLang === 'ha' ? 'HA' : 'EN'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={currentLang === 'en' ? 'bg-primary/10' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('ha')}
          className={currentLang === 'ha' ? 'bg-primary/10' : ''}
        >
          🇳🇬 Hausa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
