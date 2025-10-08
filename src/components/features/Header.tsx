import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt } from '@awesome.me/kit-26a4d59a75/icons/classic/regular';

export function Header() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <FontAwesomeIcon
          icon={faBolt}
          className="h-8 w-8 text-indigo-600 mr-2"
        />
        <h1 className="text-4xl font-bold text-gray-900">
          WebP & WebM Media Converter
        </h1>
      </div>
      <h2 className="text-lg text-gray-600">
        Convert your images to WebP and videos to WebM for better web performance.
      </h2>
    </div>
  );
}