import React from 'react';
import { Row, Typography } from 'antd';

import Emojione from '@components/emojione/emojione';
import Languages from '@features/global/services/languages-service';

const { Text, Link } = Typography;
export const ApplicationHelp = () => (
  <Row align="middle" justify="start" className="bottom-margin">
    <Text type="secondary">
      <Emojione type=":exploding_head:" />{' '}
      {Languages.t('scenes.app.popup.appsparameters.pages.application_editor.help_text')}
      <Link onClick={() => window.open('https://doc.tdrive.app', 'blank')}>
        {Languages.t('scenes.app.popup.appsparameters.pages.application_editor.help_link')}
      </Link>
    </Text>
  </Row>
);
