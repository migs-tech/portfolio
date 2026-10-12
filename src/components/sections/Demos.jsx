import { OjtrackDemo } from '../demos/OjtrackDemo';
import { PrimesysDemo } from '../demos/PrimesysDemo';
import { Reveal, Section } from '../ui/Section';

// Hands-on replicas of each system's core flow, so visitors can use them here.
export function Demos() {
  return (
    <Section
      id="demos"
      index="02"
      label="Try it"
      title="Try the systems yourself"
      intro="Working replicas of each system’s core flow, built for this page with sample data. Click through them; nothing is sent anywhere."
      className="section-alt"
    >
      <div className="demo-stack">
        <Reveal className="demo-card spotlight" data-pointer>
          <OjtrackDemo />
        </Reveal>
        <Reveal className="demo-card spotlight" data-pointer>
          <PrimesysDemo />
        </Reveal>
      </div>
    </Section>
  );
}
