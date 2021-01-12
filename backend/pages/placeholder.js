/** @jsx jsx */

import { useState } from 'react';
import { jsx } from '@emotion/core';

import { Container, Grid, Cell } from '@arch-ui/layout';
import { PageTitle } from '@arch-ui/typography';

import DocTitle from '@keystonejs/app-admin-ui/client/components/DocTitle'

import { HeaderInset } from '../components/HeaderInset'

const Placeholder = () => {
    return (
        <main>
            <DocTitle title="Placeholder" />
            <Container>
                <HeaderInset>
                    <PageTitle>Placeholder</PageTitle>
                </HeaderInset>
                <Grid gap={16}>
                    <p>Need to add some content.</p>
                    <a href="/a/">Portal</a>
                </Grid>
            </Container>
        </main>        
    )   
}

export default Placeholder;