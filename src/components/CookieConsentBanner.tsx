import { useEffect } from 'react';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

export default function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: { enabled: false },
        marketing: { enabled: false },
      },
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom right',
        },
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'Cookie Preferences',
              description:
                'We use cookies to ensure the website functions correctly and to improve your experience. You can manage your preferences below.',
              acceptAllBtn: 'Accept All',
              acceptNecessaryBtn: 'Reject Non-Essential',
              showPreferencesBtn: 'Manage Preferences',
            },
            preferencesModal: {
              title: 'Cookie Settings',
              acceptAllBtn: 'Accept All',
              acceptNecessaryBtn: 'Reject Non-Essential',
              savePreferencesBtn: 'Save Preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Strictly Necessary',
                  description: 'These cookies are required for the website to function and cannot be disabled.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics',
                  description: 'These cookies help us understand how visitors interact with our website.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'Marketing',
                  description: 'These cookies are used to deliver relevant advertisements.',
                  linkedCategory: 'marketing',
                },
              ],
            },
          },
        },
      },
    });
  }, []);

  return null;
}

export function openCookieSettings() {
  import('vanilla-cookieconsent').then((cc) => {
    cc.showPreferences();
  });
}
