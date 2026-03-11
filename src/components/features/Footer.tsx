import packageJson from '../../../package.json';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='mt-6 p-6 rounded-xl shadow-sm border-t border-gray-200 bg-white/50'>
      <div className='text-sm text-gray-600 items-center'>
        <p className='text-center leading-6'>
          We track anonymous usage metrics to improve the app, but never see
          your data. <br />© {currentYear} Web Media Converter. All rights
          reserved.
        </p>
        <p className='text-center text-xs text-gray-500 leading-6'>
          <a
            href='https://github.com/imtweetix/web-media-converter/blob/main/CHANGELOG.md'
            target='_blank'
            rel='noopener noreferrer'
            className='text-indigo-600 hover:text-indigo-800 transition-colors'
          >
            v{packageJson.version}
          </a>
        </p>
      </div>
    </footer>
  );
}
