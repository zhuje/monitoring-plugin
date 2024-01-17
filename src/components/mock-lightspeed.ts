import { Action, ExtensionHook } from '@openshift-console/dynamic-plugin-sdk';
import React from 'react';


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
        cta: (()=>console.log('helloworld')),
      },
  ]);
  return [actions, true, null];
};

export default useLightspeedActionsExtension;