import { AlertTriangle, BookOpen, CircleDot, Clock3, ShieldCheck, Trophy, UsersRound } from 'lucide-react';
import Layout from '../components/Layout';

const ruleSections = [
  {
    icon: UsersRound,
    title: 'Teams & match format',
    rules: [
      'Each team fields 11 players. A match is played between two teams.',
      'Each innings has a maximum of 20 overs, unless the match is shortened by the organisers.',
      'A toss before play decides which team bats or fields first.',
      'Teams change innings after the first side is all out or completes its allotted overs.',
      'The first four overs of each innings are the opening Power Surge.',
    ],
  },
  {
    icon: Clock3,
    title: 'Overs & bowling',
    rules: [
      'An over consists of six valid deliveries. Wides and no-balls do not count as valid deliveries.',
      'A bowler may bowl a maximum of four overs in a full 20-over innings. Shortened matches may have a reduced limit.',
      'Bowlers must deliver from alternate ends after each over.',
      'Umpires call wides and no-balls according to the Laws of Cricket and the playing conditions.',
    ],
  },
  {
    icon: Trophy,
    title: 'Scoring & result',
    rules: [
      'Runs are scored by running between the wickets, hitting boundaries, or receiving extras.',
      'A boundary counts for four runs when the ball reaches the boundary after touching the ground, and six when it clears the boundary without touching the ground.',
      'The team scoring more runs wins. If scores are level, the match is a tie unless the organisers announce a Super Over or another tie-breaker.',
      'The batting side may be all out when ten batters are dismissed.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Dismissals & extras',
    rules: [
      'Common dismissals include bowled, caught, leg before wicket (LBW), run out, stumped, and hit wicket.',
      'Wides and no-balls add runs to the batting team and require an extra delivery.',
      'A no-ball gives the batting team a free hit on the next delivery where applicable under the match playing conditions.',
      'Byes and leg-byes may be scored when the ball passes the batter without being hit by the bat, subject to the Laws of Cricket.',
    ],
  },
  {
    icon: UsersRound,
    title: 'Impact player & substitutes',
    rules: [
      'Each team may use one Impact Player per match, selected only from its registered WBL playing squad.',
      'Any substitute fielder must also be from that team’s registered WBL squad.',
      'Inform the umpire before making an Impact Player or substitute fielder change. The umpire confirms when the change takes effect.',
    ],
  },
];

export default function RuleBook() {
  return (
    <Layout>
      <main className="page content-page rule-book-page">
        <header className="rule-book-heading">
          <span className="rule-book-eyebrow"><BookOpen size={15} aria-hidden="true" /> MATCH PLAYING CONDITIONS</span>
        </header>

        <details className="power-surge-card rule-accordion">
          <summary className="power-surge-heading">
            <span className="power-surge-icon"><ShieldCheck size={20} aria-hidden="true" /></span>
            <div>
              <span className="rule-card-eyebrow">SPECIAL PLAYING CONDITION</span>
              <h2>Power Surge</h2>
            </div>
            <span className="rule-accordion-indicator" aria-hidden="true" />
          </summary>
          <ul>
            <li>The first four overs of each innings are the opening Power Surge.</li>
            <li>The batting team may claim its additional two-over Power Surge from 10.0 overs through 19.0 overs.</li>
            <li>During the Power Surge, no more than two fielders may be outside the fielding circle.</li>
            <li>The batting team must inform the umpire before the chosen Surge begins. If it does not, the fielding restrictions will not apply.</li>
          </ul>
        </details>

        <section className="rule-sections" aria-label="Basic T20 rules">
          {ruleSections.map(({ icon: Icon, title, rules }, index) => (
            <details className="rule-section-card rule-accordion" key={title}>
              <summary className="rule-section-heading">
                <span className="rule-section-icon"><Icon size={19} aria-hidden="true" /></span>
                <span className="rule-section-number">{String(index + 1).padStart(2, '0')}</span>
                <h2>{title}</h2>
                <span className="rule-accordion-indicator" aria-hidden="true" />
              </summary>
              <ul>
                {rules.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
            </details>
          ))}
        </section>

        <p className="rule-book-note">
          Umpire decisions are final. The tournament organisers may issue match-specific playing conditions before a fixture.
        </p>
      </main>
    </Layout>
  );
}
