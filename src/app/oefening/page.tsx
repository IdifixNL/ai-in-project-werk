import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Oefening instructie" };

/**
 * Workshop instructions in Dutch. Static content, no data.
 * Change the text here; the layout components below keep it consistent.
 */
export default function OefeningPage() {
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6">
      <header>
        <p className="label mb-1">Workshop</p>
        <h2 className="m-0 text-[22px] font-black tracking-tight" style={{ textWrap: "balance" }}>Je AI-team aan het werk op dit bord</h2>
        <p className="mt-2 max-w-[64ch] text-[13px] leading-relaxed text-text-2">
          Je hebt een werkende cockpit: een Kanban-bord met een vaste levenscyclus en een dashboard dat daaruit leest.
          De oefening: sluit Claude Code aan op het bord, geef het een team, en laat dat team het dashboard uitbreiden
          voor jouw eigen project. Jij blijft de hele tijd de reviewer.
        </p>
      </header>

      <Section n="1" title="Waar staat wat">
        <Grid>
          <Card title="Board" href="/board">Vijf kolommen. Boven elke kolom staat wie een ticket ernaartoe mag verplaatsen: HUMAN of AGENT. Sleep kaarten, klik op een kaart voor de details.</Card>
          <Card title="Ticket">Vier tabbladen. <b>Request</b> is jouw vraag in gewone taal. <b>AI Plan</b> schrijft de agent voordat er code komt. <b>Result</b> is wat er is gedaan plus bewijs. <b>Journey</b> is wie wat deed, en wanneer.</Card>
          <Card title="Dashboard" href="/">Alle cijfers komen uit een plek: <Code>GET /api/stats</Code>. Dit is de plek die je straks uitbreidt.</Card>
          <Card title="CLAUDE.md">Het contract dat Claude Code leest bij elke sessie: de tabbladen, wie wat mag, en de zes stappen om een ticket te doen. Jij bent de eigenaar van dit bestand.</Card>
        </Grid>
        <p className="m-0 text-[12.5px] text-text-2">
          De regel die de server afdwingt: <b className="text-text">een agent kan een ticket nooit op done zetten</b>. De agent levert af in review, jij keurt goed of stuurt terug.
          Probeer het zelf terwijl het dashboard open staat:
        </p>
        <Pre>{`curl -s -X PATCH localhost:3000/api/kanban/DEMO-15 \\
  -H 'content-type: application/json' \\
  -d '{"status":"done","actor":"agent:builder"}'`}</Pre>
        <p className="m-0 text-[12px] text-text-3">Je krijgt een 403 terug en er verschijnt een rode regel in de activiteit op het dashboard.</p>
      </Section>

      <Section n="2" title="Hoe je begint">
        <Steps items={[
          <>Zet je naam in de balk bovenaan. Alles wat je vanuit het scherm doet, wordt gelogd als <Code>human:jouwnaam</Code>.</>,
          <>Open een terminal in de map van dit project en start Claude Code: <Code>claude</Code>. Laat de app in een andere terminal draaien (<Code>npm run dev</Code>), de agent praat via <Code>curl</Code> met het bord.</>,
          <>Geef de eerste opdracht: <Prompt>Lees CLAUDE.md. Pak daarna DEMO-18 op van het bord en werk het ticket af.</Prompt></>,
          <>Kijk mee op het bord. Verscheen het AI Plan voordat er code veranderde? Eindigde het ticket in review, niet in done? Kun je het bewijs zelf controleren?</>,
          <>Open het ticket, tabblad Result. Keur goed, of kies <i>Request changes</i> en schrijf waarom. Stuur het bewust een keer terug en vraag Claude het ticket opnieuw op te pakken. Leest de agent jouw opmerking?</>,
        ]} />
      </Section>

      <Section n="3" title="Oefeningen om mee te spelen">
        <p className="m-0 text-[12.5px] text-text-2">Kies er een paar. Elke oefening is een ticket dat je in gewone taal schrijft, en dan aan je agent geeft. Begin klein.</p>
        <Grid>
          <Card title="Een tweede agent" level="beginner">
            Vraag Claude Code: <Prompt>Maak een agent tester in .claude/agents, in dezelfde stijl als builder. De tester controleert een ticket in review: voert de commando's uit het bewijs zelf uit en plaatst een comment met een oordeel. De tester verplaatst nooit tickets en wijzigt geen code.</Prompt>
            Lees daarna wat er is geschreven en voeg zelf een regel toe.
          </Card>
          <Card title="Een planner" level="beginner">
            Een agent die een vaag backlog-ticket leest, jou maximaal drie vragen stelt en in een comment voorstelt hoe het opgesplitst kan worden in todo-tickets. Verplaatst niets. Test het op DEMO-19.
          </Card>
          <Card title="Jouw eigen cijfer op het dashboard" level="beginner">
            Finance: omzet per klant uit een CSV. Delivery: open risico's. Operations: incidenten per week. Schrijf het ticket zoals je het aan een collega zou uitleggen. De agent breidt <Code>getStats()</Code> uit en zet er een tegel bij.
          </Card>
          <Card title="Geblokkeerd-vlag" level="gemiddeld">
            Een ticket kan vastzitten omdat je op iemand wacht. Vraag om een <Code>blocked</Code>-veld met reden, zichtbaar op de kaart en als teller op het dashboard. Dit raakt schema, API en UI tegelijk: kijk of het plan alle drie noemt.
          </Card>
          <Card title="Screenshots als bewijs met Playwright" level="gemiddeld">
            Nu is bewijs tekst. Laat de agent Playwright toevoegen en na elk ticket een screenshot van de gewijzigde pagina maken, opgeslagen in <Code>data/evidence/</Code>, met het pad als evidence op het ticket. Eerste ticket: <Prompt>Voeg Playwright toe als dev-dependency en een script npm run shot dat een screenshot van een URL opslaat in data/evidence. Werk CLAUDE.md bij: bij elk UI-ticket hoort een screenshot als bewijs.</Prompt>
          </Card>
          <Card title="Bewijs verplicht" level="gemiddeld">
            Pas de server aan: een ticket mag alleen naar review als er een verdict en minstens een bewijsstuk is. Zonder bewijs: 400 met uitleg. Kijk hoe je agent reageert op de foutmelding.
          </Card>
          <Card title="CSV-export" level="beginner">
            Een knop op het dashboard die alle tickets als CSV downloadt, voor het maandagoverleg. Klein, compleet, en goed te controleren.
          </Card>
          <Card title="Doorlooptijd" level="gemiddeld">
            Hoe lang staat een ticket gemiddeld van todo tot done? De journey-log heeft alle tijdstempels. Vraag om een tegel en een lijstje van de vijf traagste tickets.
          </Card>
        </Grid>
      </Section>

      <Section n="4" title="Waar je het bord voor kunt gebruiken">
        <Grid>
          <Card title="Software en scripts">Het meest voor de hand liggend: features, bugs, refactors. De agent bouwt, jij reviewt het plan en het bewijs.</Card>
          <Card title="Documenten en analyses">Een ticket kan ook zijn: "schrijf de projectstatus voor de stuurgroep" of "analyseer dit CSV-bestand en vat samen". Bewijs is dan het bestand plus hoe het is gecontroleerd.</Card>
          <Card title="Onderzoek">Vragen als "vergelijk drie tools voor X" of "wat zijn de risico's van Y". Het AI Plan laat zien welke bronnen de agent gaat gebruiken, voordat het begint.</Card>
          <Card title="Terugkerend werk">Wekelijkse rapportage, data-checks, opschonen. Zet ze als tickets in de backlog en promoot ze naar todo als het tijd is.</Card>
        </Grid>
      </Section>

      <Section n="5" title="Waar je op let tijdens het reviewen">
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[12.5px] text-text-2">
          <Li>Had je bij het plan al nee kunnen zeggen, voordat er code was? Zo niet, dan was het plan te vaag. Zeg dat in een comment.</Li>
          <Li>Kun je de claim controleren zonder de code te lezen? "Het werkt" is geen bewijs. Een commando met uitvoer, een screenshot, een bestandspad wel.</Li>
          <Li>Deed het team iets wat je een nieuwe collega niet zou laten doen? Dan mist er een regel in CLAUDE.md of in de agent. Voeg hem toe.</Li>
          <Li>Backlog naar todo is van jou. Pakt de agent uit de backlog, dan is dat een regel die je bent vergeten op te schrijven.</Li>
        </ul>
      </Section>

      <Section n="6" title="Als het vastloopt">
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[12.5px] text-text-2">
          <Li>Bord leeg of foutmeldingen: stop <Code>npm run dev</Code>, verwijder <Code>data/cockpit.db</Code>, start opnieuw. De demo-data komt terug.</Li>
          <Li>Poort 3000 bezet: <Code>npm run dev -- -p 3001</Code>, en vertel je agent de nieuwe poort.</Li>
          <Li>Liever Docker: <Code>docker compose up --build</Code>, dan http://localhost:3000.</Li>
          <Li>Windows en curl: PowerShell breekt JSON-aanhalingstekens. Gebruik Git Bash als je de API zelf met de hand probeert. De agent lost dit zelf op.</Li>
          <Li>Alle API-aanroepen staan in <Code>docs/api.md</Code>, de volledige oefening in <Code>docs/workshop.md</Code>.</Li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel px-5 py-4">
      <h3 className="m-0 flex items-center gap-3 text-[14px] font-bold">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] bg-purple font-mono text-[11px] text-white">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{children}</div>;
}

function Card({ title, href, level, children }: { title: string; href?: string; level?: "beginner" | "gemiddeld"; children: ReactNode }) {
  const heading = href ? <a href={href} className="text-purple-hi no-underline hover:underline">{title}</a> : title;
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-line bg-card px-3.5 py-3 text-[12.5px] leading-relaxed text-text-2">
      <div className="flex items-center gap-2 text-[12.5px] font-bold text-text">
        {heading}
        {level && <span className={`tag ${level === "beginner" ? "tag-medium" : "tag-high"}`}>{level}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[24px_1fr] gap-3 text-[12.5px] leading-relaxed text-text-2">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-line-hi font-mono text-[10px] text-text-3">{i + 1}</span>
          <span>{it}</span>
        </li>
      ))}
    </ol>
  );
}

function Li({ children }: { children: ReactNode }) {
  return (
    <li className="grid grid-cols-[14px_1fr] gap-2">
      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-purple-hi" />
      <span>{children}</span>
    </li>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-[3px] bg-purple-10 px-1.5 py-0.5 font-mono text-[11px] text-text">{children}</code>;
}

function Pre({ children }: { children: string }) {
  return <pre className="m-0 overflow-x-auto rounded-md border border-line bg-card px-3.5 py-3 font-mono text-[11.5px] leading-relaxed text-text">{children}</pre>;
}

/** A prompt the participant can copy into Claude Code. */
function Prompt({ children }: { children: ReactNode }) {
  return (
    <span className="my-1.5 block rounded-md border-l-2 border-purple-hi bg-purple-10 px-3 py-2 text-[12px] italic text-text">
      {children}
    </span>
  );
}
