/**
 * Site footer
 * 
 * Minimal, clean footer.
 */

export function Footer() {
  return (
    <footer className="border-t border-shadow-800/20 mt-auto">
      <div className="container-wide py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-shadow-500 font-ui">
          <p>
            Boards by{' '}
            <a 
              href="https://bingobrawlers.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-parchment-400 hover:text-gold-400 transition-colors"
            >
              Bingo Brawlers
            </a>
          </p>
          <p className="text-shadow-600">
            Elden Bingo Archive
          </p>
        </div>
      </div>
    </footer>
  )
}
