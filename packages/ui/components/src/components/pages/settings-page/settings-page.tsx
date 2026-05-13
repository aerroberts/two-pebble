import { Header } from '../../content/header/header';
import { Button } from '../../input/button/button';
import { NotificationsSection } from './notifications-section';
import { PreferencesSection } from './preferences-section';
import { ProfileSection } from './profile-section';

export interface SettingsPageProps {
  scope?: 'contained' | 'viewport';
}

export function SettingsPage(props: SettingsPageProps) {
  const rootClassName = props.scope === 'contained' ? 'w-full' : 'w-full min-h-screen bg-background';

  return (
    <div className={rootClassName}>
      <div className="w-full max-w-[800px] mx-auto px-8 py-6">
        <Header>Settings</Header>
        <ProfileSection />
        <PreferencesSection />
        <NotificationsSection />
        <div className="flex gap-2 border-t border-border pt-6">
          <Button variant="primary">Save changes</Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
