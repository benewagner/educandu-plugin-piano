import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import DebouncedInput from '@educandu/educandu/components/debounced-input.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import { SOURCE_TYPE } from '@educandu/educandu/domain/constants.js';
import PublicIcon from '@educandu/educandu/components/icons/general/public-icon.js';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import PrivateIcon from '@educandu/educandu/components/icons/general/private-icon.js';
import { analyzeMediaUrl } from '@educandu/educandu/utils/media-utils.js';
import WikimediaIcon from '@educandu/educandu/components/icons/wikimedia/wikimedia-icon.js';
import { BankOutlined, GlobalOutlined, WarningOutlined, YoutubeOutlined } from '@ant-design/icons';
import ResourceSelectorDialog from '@educandu/educandu/components/resource-selector/resource-selector-dialog.js';
import { getSourceType, getPortableUrl, getAccessibleUrl, createMetadataForSource } from '@educandu/educandu/utils/source-utils.js';

function UrlInput({ value, allowedSourceTypes, disabled, onChange }) {
  const { t } = useTranslation('urlInput');
  const clientConfig = useService(ClientConfig);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const unsecureUrl = value && value.startsWith('http://');

  const sourceType = useMemo(() => {
    const newSourceType = getSourceType({ url: value, cdnRootUrl: clientConfig.cdnRootUrl });
    return allowedSourceTypes.includes(newSourceType) ? newSourceType : SOURCE_TYPE.unsupported;
  }, [clientConfig.cdnRootUrl, value, allowedSourceTypes]);

  const inputPrefixIcon = useMemo(() => {
    switch (sourceType) {
      case SOURCE_TYPE.none:
        return null;
      case SOURCE_TYPE.youtube:
        return <YoutubeOutlined />;
      case SOURCE_TYPE.wikimedia:
        return <WikimediaIcon />;
      case SOURCE_TYPE.mediaLibrary:
        return <BankOutlined />;
      case SOURCE_TYPE.documentMedia:
        return <PublicIcon />;
      case SOURCE_TYPE.roomMedia:
        return <PrivateIcon />;
      case SOURCE_TYPE.external:
        return unsecureUrl ? <WarningOutlined /> : <GlobalOutlined />;
      default:
        return <WarningOutlined />;
    }
  }, [sourceType, unsecureUrl]);

  const handleInputValueChange = newValue => {
    const accessibleUrl = getAccessibleUrl({ url: newValue, cdnRootUrl: clientConfig.cdnRootUrl });
    const { sanitizedUrl } = analyzeMediaUrl(accessibleUrl);
    const portableUrl = getPortableUrl({ url: sanitizedUrl, cdnRootUrl: clientConfig.cdnRootUrl });

    const metadata = createMetadataForSource({ url: portableUrl, cdnRootUrl: clientConfig.cdnRootUrl });

    onChange(portableUrl, metadata);
  };

  const handleDebouncedInputValueChange = event => {
    handleInputValueChange(event.target.value);
  };

  const handleSelectButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogSelect = newUrl => {
    handleInputValueChange(newUrl);
    setIsDialogOpen(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const renderInputPrefix = () => {
    const tooltipTitle = `${t('common:source')}: ${t(`tooltip_${sourceType}`)}`;
    const classes = classNames(
      'UrlInput-prefix',
      { 'UrlInput-prefix--error': sourceType === SOURCE_TYPE.unsupported },
      { 'UrlInput-prefix--warning': unsecureUrl }
    );

    return (
      <Tooltip title={tooltipTitle}>
        <div className={classes}>
          {inputPrefixIcon}
        </div>
      </Tooltip>
    );
  };

  const classes = classNames(
    'UrlInput',
    'u-input-and-button',
    { 'UrlInput--warning': unsecureUrl }
  );

  return (
    <div className={classes}>
      <DebouncedInput
        value={value}
        disabled={disabled}
        addonBefore={renderInputPrefix()}
        onChange={handleDebouncedInputValueChange}
        />
      <Button
        type="primary"
        disabled={disabled}
        onClick={handleSelectButtonClick}
        >
        {t('common:select')}
      </Button>
      {!!unsecureUrl && (
        <div className="UrlInput-warning">{t('unsecureUrl')}</div>
      )}
      <ResourceSelectorDialog
        url={value}
        isOpen={isDialogOpen}
        allowedSourceTypes={allowedSourceTypes}
        onSelect={handleDialogSelect}
        onClose={handleDialogClose}
        />
    </div>
  );
}

UrlInput.propTypes = {
  allowedSourceTypes: PropTypes.arrayOf(PropTypes.oneOf(Object.values(SOURCE_TYPE))),
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
};

UrlInput.defaultProps = {
  allowedSourceTypes: Object.values(SOURCE_TYPE),
  disabled: false,
  value: ''
};

export default UrlInput;
