import * as React from 'react';

import ActivityList from '@/components/activity-list'

const { useEffect, useState } = React

function List({ data, state, refetch }) {
    const [{cred,reqId}, setCred] = useState({cred:"", reqId:null});

    switch (state) {
      case 'loading': {
        return <p>Loading...</p>;
      }
      case 'error': {
        return <p>Error!</p>;
      }
      case 'loaded': {
        if (!data) {
              return <p>Ooops, something went wrong!</p>
        }
        return ( <ActivityList data={data.allActivities}/> )
      }
    }
    return (<></>)
  }

  export default List