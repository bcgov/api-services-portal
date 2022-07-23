import { createContext, useContext } from 'react';
import groupBy from 'lodash/groupBy';
import {
  GatewayPlugin,
  GatewayPluginCreateInput,
  GatewayRoute,
  GatewayService,
} from '@/shared/types/query.types';

const ConsumerPluginContext = createContext({
  get() {
    return 'hi';
  },
});

const usePlugins = () => useContext(ConsumerPluginContext);

export default usePlugins;
