import packageJson from '../../../package.json';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='mt-6 p-6 rounded-xl shadow-sm border-t border-gray-200 bg-white/50'>
      <div className='text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
        <p className='text-center md:text-left'>
          © {currentYear} Web Media Converter. All rights reserved. <br />
          Made with ❤️ by{' '}
          <a
            href='https://github.com/imtweetix'
            target='_blank'
            rel='noopener noreferrer'
            className='text-indigo-600 hover:text-indigo-800 transition-colors'
          >
            Marc Joseph
          </a>
        </p>
        <p className='text-center md:text-right text-xs text-gray-500'>
          v{packageJson.version}
        </p>
      </div>
    </footer>
  );
}
