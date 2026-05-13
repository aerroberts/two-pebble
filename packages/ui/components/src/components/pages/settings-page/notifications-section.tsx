import { useState } from 'react';

import { Section } from '../../content/section/section';
import { ButtonGroup } from '../../input/button-group/button-group';
import { Checkbox } from '../../input/checkbox/checkbox';

export function NotificationsSection() {
  const [notifications, setNotifications] = useState('all');

  return (
    <Section title="Notifications">
      <div className="flex flex-col gap-4">
        <ButtonGroup
          value={notifications}
          onChange={setNotifications}
          options={[
            { value: 'all', label: 'All notifications' },
            { value: 'important', label: 'Important only' },
            { value: 'none', label: 'None' },
          ]}
        />
        <Checkbox label="Send weekly digest email" defaultChecked />
        <Checkbox label="Send push notifications" />
      </div>
    </Section>
  );
}
