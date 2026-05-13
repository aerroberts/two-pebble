import { Section } from '../../content/section/section';
import { Input } from '../../input/input/input';
import { InputArea } from '../../input/input-area/input-area';

export function ProfileSection() {
  return (
    <Section title="Profile">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Input label="First name" placeholder="Jane" />
          <Input label="Last name" placeholder="Doe" />
        </div>
        <Input label="Email" placeholder="jane@example.com" leadingIcon="mail" />
        <InputArea label="Bio" placeholder="Tell us about yourself..." rows={3} />
      </div>
    </Section>
  );
}
