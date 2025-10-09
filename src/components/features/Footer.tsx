export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='mt-12 py-5 rounded-xl shadow-sm border-t border-gray-200 bg-white/50'>
      <div className='text-center text-sm text-gray-600'>
        <p className='mb-2'>
          © {currentYear} Web Media Converter. All rights reserved.
        </p>
        <p>
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
      </div>
    </footer>
  );
}
