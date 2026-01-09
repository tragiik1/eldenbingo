/**
 * About page
 * 
 * Explanation of what this is, applications used, and rules.
 */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function About() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container-narrow">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-3xl md:text-4xl text-parchment-100 mb-4">
            About
          </h1>
        </motion.div>

        {/* Content sections */}
        <div className="space-y-16">
          {/* What is this */}
          <Section title="What is Elden Bingo?">
            <p>
              Elden Bingo is a competitive race format for Elden Ring where players race to complete 
              objectives on a randomized bingo board. The first to get a line (or full blackout) wins.
            </p>
            <p>
              This site serves as an archive for completed matches. Upload your board 
              screenshots, tag players, and keep a record of past games.
            </p>
          </Section>

          {/* Applications */}
          <Section title="Applications">
            <p className="text-shadow-500 text-sm mb-4">
              Applications developed by awsker of the Bingo Brawlers team and used during the seasons.
            </p>
            
            <div className="space-y-4">
              <div className="bg-shadow-900/50 rounded-lg p-4 border border-shadow-800">
                <h3 className="font-heading text-lg text-parchment-200 mb-2">1. Elden Bingo</h3>
                <p className="text-parchment-400 text-sm mb-3">
                  Application for hosting, playing and casting Elden Ring bingo races.
                </p>
                <a 
                  href="https://github.com/awsker/EldenBingo/releases/download/0.16.3/EldenBingo_v0.16.3.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 text-sm underline underline-offset-2"
                >
                  Download Elden Bingo v0.16.3
                </a>
              </div>

              <div className="bg-shadow-900/50 rounded-lg p-4 border border-shadow-800">
                <h3 className="font-heading text-lg text-parchment-200 mb-2">2. Season 2 Randomizer</h3>
                <p className="text-parchment-400 text-sm mb-3">
                  Randomizer used for character setup.
                </p>
                <a 
                  href="https://github.com/Nordgaren/ERBingoRandomizer/releases/download/1.0/ERBingo.Randomizer.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 text-sm underline underline-offset-2"
                >
                  Download ER Bingo Randomizer
                </a>
              </div>

              <div className="bg-shadow-900/50 rounded-lg p-4 border border-shadow-800">
                <h3 className="font-heading text-lg text-parchment-200 mb-2">3. Board Settings</h3>
                <p className="text-parchment-400 text-sm">
                  We use the <strong className="text-parchment-200">"Season 2 - Elden Ring (Basegame)"</strong> board configuration.
                </p>
              </div>
            </div>
          </Section>

          {/* General Rules */}
          <Section title="General Rules">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>All matches will be played by the <strong className="text-parchment-200">Fair play rule</strong>. Players that do not abide will be disqualified.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Must play on the <strong className="text-parchment-200">latest patch</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span><strong className="text-parchment-200">No mods</strong>, excluding startup logo removal mod.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span><strong className="text-parchment-200">No exploits, skips, or glitches</strong>. Wrong warps, out of bounds, "chainsaw" glitch, and other obvious glitches are all banned.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Stake skips are banned.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Skipping bosses unintended to be skipped is banned (e.g. skipping Godskin Noble to get to Rykard).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Gravity kill on Radahn is banned.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Quitouts are allowed to drop aggro.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Unintended but inbounds skips to get around the map faster are allowed (e.g. jumping down the wall at the start of Leyndell).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Explosive physick somber 7 skip is not allowed.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span><strong className="text-parchment-200">No rebirthing allowed.</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>No quitting out at doors or elevators.</span>
              </li>
            </ul>
          </Section>

          {/* Marking Rules */}
          <Section title="Marking Rules">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Players must mark squares <strong className="text-parchment-200">within 30 seconds</strong> after completing them (no "hiding" progress).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>For boss kills, wait for the <strong className="text-parchment-200">"Enemy Felled"</strong> text to appear before marking.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>For Boss's and Invaders the "Enemy felled" text has to appear on screen. For enemies who lack a kill text, they are marked on rune acquisition. (No map open to block the text)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>You must wait till actually acquiring items on screen on enemy death before marking.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Talismans have to be unique (Sacrificial counts however only 1).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Incants and Sorceries have to be unique for the collection squares.</span>
              </li>
            </ul>
            <p className="text-sm text-blood-500 mt-4">
              Penalty for late marking: Barred from marking square for the rest of match, but opponent(s) are not notified.
            </p>
          </Section>

          {/* Square Clarifications */}
          <Section title="Square Clarifications">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>For squares that mention <strong className="text-parchment-200">"bosses"</strong>, enemies must have a red health bar at the bottom of the screen to count (e.g. Greyoll does not count towards "Defeat 3 dragon bosses").</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>For squares that do not specifically mention "bosses", non-respawnable enemies as well as bosses count.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>For squares that mention <strong className="text-parchment-200">"Caves/Grottos", "Catacombs", or "Tunnels"</strong>, only dungeons that specifically contain those words in their title count.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Squares with killing X Boss refers to the instance not the amount. Tree Sentinel Duo is one horse boss. Killing 3 Watchdogs, the duo in Caelid count as two since the word boss is not in the square.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>For "Defeat a boss on Torrent the whole fight" square: Gravity kills do not count. If you are knocked off Torrent, you must reset the fight.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>For "Defeat 3 Erdtree Avatars" square, Putrid Avatars also count.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Shields are not weapons.</span>
              </li>
            </ul>
          </Section>

          {/* Region Clarifications */}
          <Section title="Region Clarifications">
            <p className="text-sm mb-3">For "Defeat X bosses in Limgrave/Liurnia/Caelid/Altus Plateau" squares:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Weeping Peninsula counts as Limgrave</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Dragonbarrow counts as Caelid</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Mt. Gelmir counts as Altus Plateau</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Magma Wyrm Makar counts as a Liurnia boss</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Grafted Scion counts towards Limgrave bosses</span>
              </li>
            </ul>
          </Section>

          {/* DLC Rules */}
          <Section title="Season 5 - DLC Rules">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Cannot use the Furnace Golem to kill Crucible Knight Devonia.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Cannot use the Furnace Golem to kill Giant Lightning Ram.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Cannot go to the roundtable during the prep timer. Will have to be after the prep time is over.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>The Highlander Armor set is allowed for the DLC armor set square.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Bayle counts as a remembrance boss. Bayle's Incants count as a Remembrance Weapon.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Ancient Dragon Man counts as an NPC boss but not as a Dragon boss.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Base game bosses in the DLC are: Demi Human Marigga, Tree Sentinels, Fallingstar Beast, Death Rite Bird, Senessax.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Red bear NPC counts towards red bear square and Lion, Bear, Hippo square.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Florissax sleep square is marked upon reacquiring control of character.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Drinking Thiollier concoction square marked on loading screen, not on death text.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Giving Iris of any kind is marked upon reacquiring control of character.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Interacting with dialogue on Miquella cross is counted towards visits.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Roundtable is only allowed to buy armor, both types of smithing stones.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Mark "Healing Kindred of Rot" as soon as bug is done with recovery animation.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Both versions of the Gravebird armor piece count towards the set.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Assisting NPC's in defeating Leda counts as killing an NPC Invader, but not the other way around.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Mark St. Trina upon seeing text in the cutscene.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Mark Blow a Finger after reacquiring control of character.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Remembrance weapons found on starting characters or shops are not allowed. Dropped or acquired from Enia are legal.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Scorpion stew and Gourmet scorpion stew both count towards "Acquire scorpion stew" square.</span>
              </li>
            </ul>
          </Section>

          {/* Base Game Rules */}
          <Section title="Season 5 - Base Game Rules">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Elemer of the Briar counts towards Bell Bearing Hunters.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>No quitting out on Godrick dialogue after death.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Commander O'Neill terrain kill is allowed as long as you are on ground with him.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>You are allowed to enter the game but not open the chapel doors until prep timer is over.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-shadow-500 mt-0.5">—</span>
                <span>Fallingstar beast skip at volcano manor is not allowed.</span>
              </li>
            </ul>
          </Section>

          {/* Penalties */}
          <Section title="Penalties">
            <div className="space-y-4">
              <div className="bg-blood-700/10 border border-blood-600/30 rounded-lg p-4">
                <h4 className="text-blood-500 font-ui font-medium mb-2">Disqualification</h4>
                <ul className="space-y-1 text-sm text-parchment-400">
                  <li>— Not abiding by fair play rules</li>
                  <li>— Watching another player's stream for info (including teammate)</li>
                  <li>— Using banned exploits/glitches</li>
                </ul>
              </div>

              <div className="bg-shadow-900/50 border border-shadow-800 rounded-lg p-4">
                <h4 className="text-parchment-200 font-ui font-medium mb-2">Gravity Kills</h4>
                <p className="text-sm text-parchment-400">
                  Gravity kills will nullify the progress towards any square and will require discarding everything acquired (except runes). If a boss is gravity killed you are forced to Memory of Grace.
                </p>
              </div>

              <div className="bg-shadow-900/50 border border-shadow-800 rounded-lg p-4">
                <h4 className="text-parchment-200 font-ui font-medium mb-2">Stake Skips</h4>
                <p className="text-sm text-parchment-400">
                  Accidental stake skips force you to warp to any site of grace.
                </p>
              </div>

              <div className="bg-shadow-900/50 border border-shadow-800 rounded-lg p-4">
                <h4 className="text-parchment-200 font-ui font-medium mb-2">Mismarking</h4>
                <p className="text-sm text-parchment-400">
                  If a square is mismarked you are allowed to fix it within 5 seconds, otherwise you will be forced to unmark it per ref and will be barred from completing it for the rest of the match. Opponent will be notified.
                </p>
              </div>
            </div>
          </Section>

          {/* Ref Pause */}
          <Section title="Ref Pause">
            <p className="text-sm">
              If there is a ref pause, pause in game with the menu pauser. You do not have to quit out, but just immediately pause.
            </p>
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <p>
              Matches can be tagged with optional labels for organization.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                'Short',
                'Long',
                'Close',
                'Comeback',
                'First Win',
                'Rematch',
                'Practice',
                'Tournament',
              ].map((label) => (
                <div 
                  key={label}
                  className="px-3 py-2 rounded-md bg-shadow-900/50 border border-shadow-800 text-sm text-parchment-400 font-ui"
                >
                  {label}
                </div>
              ))}
            </div>
          </Section>

          {/* Credits */}
          <Section title="Credits">
            <ul className="space-y-2 text-parchment-400">
              <li>
                Elden Bingo application by{' '}
                <a 
                  href="https://github.com/awsker/EldenBingo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
                >
                  awsker
                </a>
                {' '}of the Bingo Brawlers team
              </li>
              <li>
                Game by{' '}
                <a 
                  href="https://www.fromsoftware.jp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
                >
                  FromSoftware
                </a>
              </li>
            </ul>
          </Section>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="w-16 h-px bg-shadow-700 mx-auto mb-8" />
          <Link to="/submit" className="btn-primary">
            Submit a Match
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Section component with consistent styling
 */
interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="font-heading text-xl md:text-2xl text-parchment-200 mb-4">
        {title}
      </h2>
      <div className="font-body text-parchment-400 leading-relaxed space-y-4">
        {children}
      </div>
    </motion.section>
  )
}
