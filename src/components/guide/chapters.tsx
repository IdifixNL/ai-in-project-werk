import type { ReactNode } from "react";
import { Lead, H, Grid, Card, Steps, Bullets, Code, Pre, Prompt, Chat, Note } from "./parts";

export type Chapter = { id: string; title: string; short: string; body: ReactNode };

/**
 * The workshop guide, in Dutch. Edit text here; the index and navigation
 * in guide.tsx follow this list automatically.
 */
export const CHAPTERS: Chapter[] = [
  {
    id: "start",
    title: "Start hier",
    short: "Waar staat wat",
    body: (
      <>
        <Lead>
          Je hebt een werkende cockpit: een Kanban-bord met een vaste levenscyclus en een dashboard dat daaruit leest.
          Vandaag sluit je Claude Code aan op het bord, geef je het een team, en laat je dat team werken terwijl jij reviewt.
        </Lead>
        <Grid>
          <Card title="Board" href="/board">Vijf kolommen. Boven elke kolom staat wie een ticket ernaartoe mag verplaatsen: HUMAN of AGENT. Sleep kaarten, klik op een kaart voor de details.</Card>
          <Card title="Ticket">Vier tabbladen. <b>Request</b> is jouw vraag in gewone taal. <b>AI Plan</b> schrijft de agent voordat er code komt. <b>Result</b> is wat er is gedaan plus bewijs. <b>Journey</b> is wie wat deed, en wanneer.</Card>
          <Card title="Dashboard" href="/">Alle cijfers komen uit een plek: <Code>GET /api/stats</Code>. Dit is de plek die je straks uitbreidt.</Card>
          <Card title="CLAUDE.md en docs/project.md">Het contract dat Claude Code leest bij elke sessie (de tabbladen, wie wat mag, de stappen), en het projectbrief dat zegt waar jouw project over gaat. Jij bent de eigenaar van beide.</Card>
        </Grid>
        <H>De regel die de server afdwingt</H>
        <Lead>
          <b className="text-text">Een agent kan een ticket nooit op done zetten.</b> De agent levert af in review, jij keurt goed of stuurt terug.
          Probeer het zelf terwijl het dashboard open staat:
        </Lead>
        <Pre>{`curl -s -X PATCH localhost:3000/api/kanban/DEMO-15 \\
  -H 'content-type: application/json' \\
  -d '{"status":"done","actor":"agent:builder"}'`}</Pre>
        <Note>Je krijgt een 403 terug en er verschijnt een rode regel in de activiteit op het dashboard. Dat is het systeem dat werkt.</Note>
      </>
    ),
  },
  {
    id: "eerste-ticket",
    title: "Je eerste ticket",
    short: "Een agent, een ticket",
    body: (
      <>
        <Lead>Eerst een keer de hele cyclus met je eigen ogen zien. Een agent, een ticket, jij als reviewer.</Lead>
        <Steps items={[
          <>Zet je naam in de balk bovenaan. Alles wat je vanuit het scherm doet, wordt gelogd als <Code>human:jouwnaam</Code>.</>,
          <>Laat de app draaien in een terminal (<Code>npm run dev</Code>). Open een tweede terminal in dezelfde map en start Claude Code: <Code>claude</Code>. De agent praat via <Code>curl</Code> met het bord, dus de app moet aan staan.</>,
          <>Geef de eerste opdracht: <Prompt>Lees CLAUDE.md. Pak daarna DEMO-18 op van het bord en werk het ticket af.</Prompt></>,
          <>Kijk mee op het bord. Verscheen het AI Plan voordat er code veranderde? Eindigde het ticket in review, niet in done? Kun je het bewijs zelf controleren?</>,
          <>Open het ticket, tabblad Result. Keur goed, of kies <i>Request changes</i> en schrijf waarom. Stuur het bewust een keer terug en vraag Claude het ticket opnieuw op te pakken. Leest de agent jouw opmerking? Kijk in Journey.</>,
        ]} />
        <Note>Claude Code gebruikt hier de agent <Code>builder</Code> uit <Code>.claude/agents/builder.md</Code>. Open dat bestand, het is een halve pagina. Zo ziet een rol eruit: naam, taak, gereedschap, stappen, regels.</Note>
      </>
    ),
  },
  {
    id: "projectmanager",
    title: "Werken met de projectmanager",
    short: "Je project uitleggen, dan tickets",
    body: (
      <>
        <Lead>
          Tickets zelf typen is prima, maar zo werkt een team niet. In dit project zit een tweede agent: de <b className="text-text">projectmanager</b>.
          Jij vertelt wat je wilt, de projectmanager maakt er tickets van in de backlog. Jij zet ze op todo, de builder pakt ze op.
        </Lead>
        <H>Zo praat je met een agent</H>
        <Steps items={[
          <>Terminal 1: de app draait (<Code>npm run dev</Code>). Laat die staan.</>,
          <>Terminal 2, in dezelfde projectmap: <Code>claude</Code>. Dit is je gesprek met het team.</>,
          <>Noem de rol in je zin: <i>&quot;Gebruik de project-manager agent, …&quot;</i> of <i>&quot;Gebruik de builder, …&quot;</i>. Claude Code kiest de rol dan zeker goed. Later mag je dat weglaten.</>,
          <>Typ gewoon Nederlands. De agent antwoordt in jouw taal en vraagt door als iets onduidelijk is. Jij antwoordt in het gesprek, niet op het bord.</>,
          <>Houd het bord open in je browser. Alles wat de agent doet, zie je daar binnen een paar seconden.</>,
        ]} />
        <H>Eerst: leer je team het project kennen</H>
        <Lead>
          De projectmanager weet hoe een goed ticket eruitziet, maar weet niets van jouw project. Dat staat in <Code>docs/project.md</Code>:
          wat maken we, voor wie, wat is er al, wat telt als klaar, wat doen we niet, welke woorden gebruiken we. Elke agent leest dat bestand eerst.
          Zolang het nog een sjabloon is, begint de projectmanager met vragen. Start zo:
        </Lead>
        <Prompt>Gebruik de project-manager agent. Ik wil je vertellen waar mijn project over gaat.</Prompt>
        <Lead>
          Je krijgt maximaal vijf korte vragen. Antwoord in gewone taal, zoals aan een nieuwe collega. De projectmanager schrijft het op, laat het zien en vraagt of het klopt.
          Lees het na. Dit is het belangrijkste bestand van je team: alles wat hier verkeerd staat, komt terug in elk ticket. Je mag het altijd zelf aanpassen.
        </Lead>
        <H>Daarna: van gesprek naar tickets</H>
        <Chat lines={[
          { who: "jij", text: "Gebruik de project-manager agent. Ik wil op het dashboard zien welke klanten dit kwartaal het meeste omzet opleveren. De cijfers staan in een CSV die ik nog moet aanleveren." },
          { who: "pm", text: "Twee vragen: hoeveel klanten wil je zien, en is de CSV per factuur of per klant? Ik stel voor: (1) CSV met omzet per klant in de repo, (2) top 5 klanten als tegel op het dashboard, (3) klik op de tegel voor de volledige lijst. Akkoord?" },
          { who: "jij", text: "Top 5 is goed, per klant. Maak 1 en 2, laat 3 nog even." },
          { who: "pm", text: "Aangemaakt: DEMO-23 CSV met omzet per klant toevoegen, DEMO-24 Top 5 klanten op het dashboard. Beide in backlog, prioriteit medium." },
          { who: "jij", text: "Zet DEMO-23 op todo." },
          { who: "jij", text: "Gebruik de builder. Pak DEMO-23 op van todo en werk het af." },
          { who: "builder", text: "Plan gepubliceerd op DEMO-23. Ik voeg data/omzet.csv toe met een kolom klant en omzet, en een test die het bestand inleest. Bewijs: de test-uitvoer." },
        ]} />
        <H>De rolverdeling</H>
        <Grid>
          <Card title="Projectmanager">Kent het project uit <Code>docs/project.md</Code>. Praat met jou, stelt maximaal drie vragen, laat titels zien voor het aanmaken. Maakt tickets in backlog. Zet alleen op todo als jij dat zegt. Bouwt nooit.</Card>
          <Card title="Builder">Pakt een ticket uit todo. Schrijft eerst het AI Plan, dan pas code. Levert af in review met bewijs. Maakt nooit eigen tickets aan.</Card>
          <Card title="Jij">Beslist wat naar todo gaat. Leest het plan. Keurt goed of stuurt terug met een reden. De enige die done mag zetten.</Card>
          <Card title="Bord">Onthoudt alles. Journey laat zien wie wat deed. Het dashboard laat zien of het werk stroomt.</Card>
        </Grid>
        <H>Probeer</H>
        <Bullets items={[
          <>Beschrijf iets uit je eigen werk aan de projectmanager, zo vaag als je het zelf in je hoofd hebt. Kijk welke vragen je krijgt.</>,
          <>Laat de projectmanager een groot idee opsplitsen. Zijn de tickets klein genoeg voor een builder-sessie?</>,
          <>Vraag de projectmanager het bord te lezen en te zeggen wat als eerste moet. Ben je het eens?</>,
          <>Vertel de projectmanager tussendoor iets nieuws over je project en kijk of hij aanbiedt het in <Code>docs/project.md</Code> te zetten.</>,
          <>Open <Code>.claude/agents/project-manager.md</Code> en voeg een regel toe die bij jouw manier van werken past. Bijvoorbeeld: elk ticket krijgt een acceptatiecriterium.</>,
        ]} />
      </>
    ),
  },
  {
    id: "team",
    title: "Je team uitbreiden",
    short: "Tester, planner, en meer",
    body: (
      <>
        <Lead>
          Twee rollen heb je nu. Een team wordt interessant bij drie of vier, elk met iets wat het wel en niet mag.
          Je laat Claude Code de rol schrijven, in dezelfde vorm als builder.md, en je leest hem zelf na voordat je hem gebruikt.
        </Lead>
        <Grid>
          <Card title="Tester" level="beginner">
            <Prompt>Maak een agent tester in .claude/agents, in dezelfde stijl als builder. De tester controleert een ticket in review: voert de commando&apos;s uit het bewijs zelf uit, opent de genoemde bestanden, en plaatst een comment met een oordeel. De tester verplaatst nooit tickets en wijzigt geen code.</Prompt>
            Laat de tester los op een ticket dat de builder net heeft afgeleverd.
          </Card>
          <Card title="Reviewer-hulp" level="beginner">
            Een agent die voor jou samenvat wat er in review staat: per ticket het plan in twee zinnen, wat het bewijs is, en een vraag die jij zou moeten stellen. Leest alleen, schrijft alleen comments.
          </Card>
          <Card title="Schrijver" level="beginner">
            Documentatie hoort ook op het bord. Een agent die bij elk afgerond ticket controleert of README of docs bijgewerkt moeten worden, en daar een ticket voor voorstelt aan de projectmanager.
          </Card>
          <Card title="Bewaker" level="gemiddeld">
            Een agent die het bord doorloopt en afwijkingen meldt: tickets die langer dan een dag in in_progress staan, tickets in review zonder bewijs, tickets in todo zonder request. Alleen comments, nooit verplaatsen.
          </Card>
        </Grid>
        <Note>Vuistregel: elke rol krijgt een lijstje <i>nooit</i>. Wat een agent niet mag is belangrijker dan wat hij wel mag.</Note>
      </>
    ),
  },
  {
    id: "oefeningen",
    title: "Het bord verbeteren",
    short: "Oefeningen op de cockpit zelf",
    body: (
      <>
        <Lead>De cockpit is bewust klein. Dit zijn tickets die je via de projectmanager kunt aanmaken en door de builder kunt laten doen. Begin bij beginner.</Lead>
        <Grid>
          <Card title="CSV-export" level="beginner">
            Een knop op het dashboard die alle tickets als CSV downloadt, voor het maandagoverleg. Klein, compleet, en goed te controleren.
          </Card>
          <Card title="Jouw eigen cijfer op het dashboard" level="beginner">
            Een tegel met een getal dat voor jouw project telt. De agent breidt <Code>getStats()</Code> uit en zet er een tegel bij. Zie ook het hoofdstuk Inspiratie.
          </Card>
          <Card title="Geblokkeerd-vlag" level="gemiddeld">
            Een ticket kan vastzitten omdat je op iemand wacht. Vraag om een <Code>blocked</Code>-veld met reden, zichtbaar op de kaart en als teller op het dashboard. Dit raakt schema, API en UI tegelijk: kijk of het plan alle drie noemt.
          </Card>
          <Card title="Screenshots als bewijs met Playwright" level="gemiddeld">
            Nu is bewijs tekst. Laat de agent Playwright toevoegen en na elk UI-ticket een screenshot maken van de gewijzigde pagina, opgeslagen in <Code>data/evidence/</Code>, met het pad als bewijs op het ticket.
            <Prompt>Voeg Playwright toe als dev-dependency en een script npm run shot dat een screenshot van een URL opslaat in data/evidence. Werk CLAUDE.md bij: bij elk UI-ticket hoort een screenshot als bewijs.</Prompt>
          </Card>
          <Card title="Bewijs verplicht" level="gemiddeld">
            Pas de server aan: een ticket mag alleen naar review als er een verdict en minstens een bewijsstuk is. Zonder bewijs: 400 met uitleg. Kijk hoe je agent reageert op de foutmelding.
          </Card>
          <Card title="Doorlooptijd" level="gemiddeld">
            Hoe lang staat een ticket gemiddeld van todo tot done? De journey-log heeft alle tijdstempels. Vraag om een tegel en een lijstje van de vijf traagste tickets.
          </Card>
          <Card title="Wie doet wat" level="beginner">
            Een klein overzicht op het dashboard: per agent hoeveel tickets in behandeling, hoeveel afgeleverd, hoeveel teruggestuurd. Alles staat al in de events.
          </Card>
          <Card title="Meerdere borden" level="gemiddeld">
            Een <Code>board</Code>-veld op tickets en een tabblad per bord. Handig als je team aan twee projecten werkt. Groot genoeg om te zien of de projectmanager het goed opsplitst.
          </Card>
        </Grid>
      </>
    ),
  },
  {
    id: "inspiratie",
    title: "Inspiratie per rol",
    short: "Finance, PM, design, code",
    body: (
      <>
        <Lead>
          Het bord is niet alleen voor software. Een ticket is een stuk werk met een vraag, een plan, een resultaat en bewijs.
          Kies wat bij jouw werk past en laat de projectmanager er tickets van maken.
        </Lead>
        <Grid>
          <Card title="Finance en control">
            <Bullets items={[
              <>Omzet per klant of per maand uit een CSV op het dashboard, met een tegel voor de top 5.</>,
              <>Een controle-agent die een exportbestand naloopt op lege velden, dubbele regels en bedragen buiten een bandbreedte, en een rapport als bewijs plaatst.</>,
              <>Maandafsluiting als terugkerende tickets in de backlog: dezelfde checklist elke maand, met bewijs per stap.</>,
              <>Facturen ouder dan 30 dagen als teller, met de lijst erachter.</>,
            ]} />
          </Card>
          <Card title="Projectmanager">
            <Bullets items={[
              <>Risico-register als tickets met label <Code>risico</Code>: kans, impact, eigenaar. Een tegel met open risico&apos;s op het dashboard.</>,
              <>Een stuurgroep-samenvatting die een agent schrijft uit de journey-log van de afgelopen week: wat is af, wat wacht op jou, wat zit vast.</>,
              <>Besluiten die genomen moeten worden als tickets in review, met jou als beslisser. De tijd in review is dan je beslistijd.</>,
              <>Laat de projectmanager-agent een projectplan opsplitsen in tickets en kijk of je de volgorde herkent.</>,
            ]} />
          </Card>
          <Card title="Designer">
            <Bullets items={[
              <>De lichte modus van de cockpit nalopen tegen de Conclusion-huisstijl en afwijkingen als tickets aanmaken.</>,
              <>Screenshots als bewijs (Playwright, zie Oefeningen) zodat elk UI-ticket een voor-en-na plaatje heeft.</>,
              <>Een ticketkaart-variant voor design-werk: een veld voor de link naar het ontwerp en een checklist voor toegankelijkheid.</>,
              <>Een agent die bij elk UI-ticket controleert op contrast, focusstaat en tekstlengte, en dat als comment plaatst.</>,
            ]} />
          </Card>
          <Card title="Developer">
            <Bullets items={[
              <>Tests als verplicht bewijs: een ticket mag alleen naar review als <Code>npm test</Code> groen is en de uitvoer als bewijs staat.</>,
              <>Een tester-agent die de builder tegenspreekt. Laat ze een ticket lang heen en weer gaan en lees de Journey.</>,
              <>Bewijs verplicht op de server (400 zonder bewijs) en kijk hoe de builder zijn werkwijze aanpast.</>,
              <>Laat twee builders parallel werken aan twee tickets en zoek uit wat er misgaat op het bord.</>,
            ]} />
          </Card>
          <Card title="Consultant en analist">
            <Bullets items={[
              <>Een onderzoeksvraag als ticket: &quot;vergelijk drie tools voor X&quot;. Het AI Plan noemt de bronnen voordat het begint, het resultaat is een korte notitie met bronnen als bewijs.</>,
              <>Interviewnotities samenvatten tot bevindingen, met per bevinding de zin uit de notitie als bewijs.</>,
              <>Een presentatie-outline uit een set tickets die done zijn.</>,
            ]} />
          </Card>
          <Card title="HR, marketing, operations">
            <Bullets items={[
              <>Vacatureteksten of campagneteksten als tickets: request in gewone taal, resultaat is de tekst, bewijs is de checklist waar hij aan is getoetst.</>,
              <>Incidenten of aanvragen per week als tegel, uit een CSV-export van je eigen systeem.</>,
              <>Onboarding van een nieuwe collega als set tickets die de projectmanager aanmaakt uit een checklist.</>,
            ]} />
          </Card>
        </Grid>
        <Note>Bij alles geldt: schrijf de request zoals je het aan een collega zou uitleggen. Wat, voor wie, waarom. Het hoe is voor de agent, en dat lees je in het plan.</Note>
      </>
    ),
  },
  {
    id: "reviewen",
    title: "Reviewen",
    short: "Waar je op let",
    body: (
      <>
        <Lead>Je werk verschuift van maken naar beoordelen. Vier vragen bij elk ticket dat in review staat.</Lead>
        <Bullets items={[
          <>Had je bij het plan al nee kunnen zeggen, voordat er code was? Zo niet, dan was het plan te vaag. Zeg dat in een comment.</>,
          <>Kun je de claim controleren zonder de code te lezen? &quot;Het werkt&quot; is geen bewijs. Een commando met uitvoer, een screenshot, een bestandspad wel.</>,
          <>Deed het team iets wat je een nieuwe collega niet zou laten doen? Dan mist er een regel in CLAUDE.md of in de agent. Voeg hem toe.</>,
          <>Backlog naar todo is van jou. Pakt de agent uit de backlog, dan is dat een regel die je bent vergeten op te schrijven.</>,
        ]} />
        <H>Aan het eind van de dag</H>
        <Lead>Schrijf een regel op die je hebt toegevoegd aan CLAUDE.md of aan een agent, en waarom. Die regel is het echte resultaat van vandaag.</Lead>
      </>
    ),
  },
  {
    id: "hulp",
    title: "Als het vastloopt",
    short: "Reset, poort, Docker",
    body: (
      <>
        <Lead>
          Eerste stap, altijd: vraag het aan Claude Code zelf. Start <Code>claude</Code> in de projectmap en plak de foutmelding erbij.
          Het kent de bekende problemen uit CLAUDE.md en lost ze voor je op.
        </Lead>
        <Prompt>De app start niet. Dit is wat ik zie in de terminal: [plak de foutmelding]. Help me het werkend te krijgen.</Prompt>
        <H>Wat het meestal is</H>
        <Bullets items={[
          <>Bord leeg of foutmeldingen: stop <Code>npm run dev</Code>, verwijder <Code>data/cockpit.db</Code>, start opnieuw. De demo-data komt terug.</>,
          <>Poort 3000 bezet: <Code>npm run dev -- -p 3001</Code>, en vertel je agent de nieuwe poort.</>,
          <>Liever Docker: <Code>docker compose up --build</Code>, dan http://localhost:3000.</>,
          <>Windows en curl: PowerShell breekt JSON-aanhalingstekens. Gebruik Git Bash als je de API zelf met de hand probeert. De agent lost dit zelf op.</>,
          <>De agent ziet het bord niet: draait de app? De agent gebruikt <Code>curl localhost:3000</Code> op jouw machine.</>,
          <>De agent zet een ticket op done: dat kan niet, de server weigert. Zie je het toch, dan deed een mens het.</>,
          <>Alle API-aanroepen staan in <Code>docs/api.md</Code>, het contract in <Code>CLAUDE.md</Code>, de rollen in <Code>.claude/agents/</Code>.</>,
        ]} />
      </>
    ),
  },
];
