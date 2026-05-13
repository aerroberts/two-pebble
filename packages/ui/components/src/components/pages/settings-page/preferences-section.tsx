import { useState } from 'react';

import { Section } from '../../content/section/section';
import { ButtonGroup } from '../../input/button-group/button-group';
import { Select } from '../../input/select/select';

export function PreferencesSection() {
  const [visibility, setVisibility] = useState('public');

  return (
    <Section title="Preferences">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium leading-5 text-content">Region</span>
          <Select
            placeholder="Choose region"
            searchable
            options={[
              { value: 'us-east-1', label: 'US East (N. Virginia)' },
              { value: 'us-west-2', label: 'US West (Oregon)' },
              { value: 'eu-west-1', label: 'EU (Ireland)' },
              { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium leading-5 text-content">Visibility</span>
          <ButtonGroup
            options={[
              { value: 'public', label: 'Public' },
              { value: 'private', label: 'Private' },
              { value: 'unlisted', label: 'Unlisted' },
            ]}
            value={visibility}
            onChange={setVisibility}
          />
        </div>
      </div>
    </Section>
  );
}
