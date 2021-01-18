import * as React from 'react';
import Modal from 'react-modal';

import { GET_LIST } from './queries'

import { useAppContext } from '../../context'

const { useEffect, useState } = React;

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import List from './list'

const customStyles = {
    content : {
      top                   : '30%',
      left                  : '20%',
      right                 : '20%',
      bottom                : 'auto',
      transformx             : 'translate(-50%, -50%)'
    },
    overlay: {
    }
};

const MyCredentialsPage = () => {
    const context = useAppContext()

    let [{ state, data }, setState] = useState({ state: 'loading', data: null });

    let fetch = () => {
        graphql(GET_LIST, { id : context.user ? context.user.userId : "" })
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, [context.user]);

    var subtitle;
    const [modalIsOpen,setIsOpen] = React.useState(false);
    function openModal() {
      setIsOpen(true);
    }
   
    function afterOpenModal() {
      // references are now sync'd and can be accessed.
      subtitle.style.color = '#f00';
    }
   
    function closeModal(){
      setIsOpen(false);
    }
    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>My Credentials</h1>
            <p style={styles.introText}>
                This is for Developers wishing to access BC Government APis.
            </p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
                <h2 style={styles.appHeading}>Credentials</h2>
                {/* <button style={styles.primaryButton}>Generate new API Key</button>
                <button style={styles.primaryButton} onClick={openModal}>Request Access</button> */}

                <List data={data} state={state} refetch={fetch} />

            </div>

            <Modal
                    isOpen={modalIsOpen}
                    onAfterOpen={afterOpenModal}
                    onRequestClose={closeModal}
                    style={customStyles}
                    contentLabel="Request Access"
                >
                    <div style={styles.innerModal}>
                        <h2 ref={_subtitle => (subtitle = _subtitle)}>Request Access</h2>
                        <div>Step 1. Select the API that you want to get access to?</div>
                        <div>Step 2. Which Environment?</div>
                        <form>
                            <button style={styles.primaryButton}>Submit</button>
                            <button style={styles.primaryButton} onClick={closeModal}>close</button>
                        </form>
                    </div>
                </Modal>                

        </div>
    )
}

export default MyCredentialsPage;

