import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faBoxArchive } from '@awesome.me/kit-26a4d59a75/icons/classic/regular';
import { Card } from '../ui';

export function InfoCard() {
  return (
    <Card>
      <div className="flex items-start space-x-3">
        <FontAwesomeIcon
          icon={faBolt}
          className="h-6 w-6 text-indigo-600 mt-1"
        />
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            About WebP Format
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            WebP is a modern image format that provides superior lossless
            and lossy compression for images on the web. It typically
            reduces file sizes by 25-50% compared to JPEG and PNG while
            maintaining similar quality, making your websites load faster
            and use less bandwidth.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faBoxArchive}
                className="h-4 w-4 mr-1"
              />
              <span>Built-in ZIP creation</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 mr-1 rounded file-preview"></span>
              <span>Transparency preserved</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}