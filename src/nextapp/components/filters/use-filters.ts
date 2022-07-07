import { useReducer } from 'react';

type FilterActionType = 'addFilter' | 'clearFilters' | 'removeFilter';

type FilterAction = {
  type: FilterActionType;
  filterType?: string;
  payload?: string;
};

type FilterReturn<T> = {
  state: T;
  addFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  removeFilter: (key: string, value: string) => void;
};

const useFilters = <FilterState>(
  initialState: FilterState
): FilterReturn<FilterState> => {
  const [state, dispatch] = useReducer(
    (state: FilterState, action: FilterAction): FilterState => {
      switch (action.type) {
        case 'addFilter':
          return {
            ...state,
            [action.filterType]: [...state[action.filterType], action.payload],
          };

        case 'clearFilters':
          return initialState;

        case 'removeFilter':
          return {
            ...state,
            [action.filterType]: state[action.filterType].filter(
              (value) => value !== action.payload
            ),
          };

        default:
          throw new Error();
      }
    },
    initialState
  );

  return {
    state,
    addFilter: (key: string, value: string): void => {
      dispatch({
        type: 'addFilter',
        payload: value,
        filterType: key,
      });
    },
    removeFilter: (key: string, value: string): void => {
      dispatch({
        type: 'removeFilter',
        payload: value,
        filterType: key,
      });
    },
    clearFilters: () => {
      dispatch({
        type: 'clearFilters',
      });
    },
  };
};

export default useFilters;
