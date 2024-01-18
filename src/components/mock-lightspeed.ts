import { Action, ExtensionHook } from '@openshift-console/dynamic-plugin-sdk';
import React from 'react';
/**
 * Mock module for testing <ActionServiceProvider> components
 * for Lightspeed extension.
 * @returns a mock Lightspeed extension
 */
const useLightspeedActionsExtension: ExtensionHook<Array<Action>> = () => {
  const href = `/monitoring/dashboards`;
  const [actions] = React.useState([
    {
      id: 'lightspeed-link',
      label: 'lightspeed-label-link',
      cta: { href },
    },
    {
      id: 'lightspeed-callback',
      label: 'lightspeed-label-callback',
      // eslint-disable-next-line no-console
      cta: () => console.log('helloworld'),
    },
  ]);
  return [actions, true, null];
};

export default useLightspeedActionsExtension;
