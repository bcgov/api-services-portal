import { useReducer } from 'react';

type FilterActionType = 'addFilter' | 'clearFilters' | 'removeFilter';

type FilterAction = {
  type: FilterActionType;
  filterType?: string;
  payload?: string | Record<string, string>;
};

type FilterReturn<T> = {
  state: T;
  addFilter: (key: string, value: Record<string, string>) => void;
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
          if (
            state[action.filterType].find((f) => {
              if (typeof action.payload !== 'string') {
                return f.value === action.payload?.value;
              }
              return false;
            })
          ) {
            return state;
          }
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
              (value) => value.name !== action.payload
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
    addFilter: (key: string, value: Record<string, string>): void => {
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
