/** @jsx jsx */

import { useState } from 'react';
import { jsx } from '@emotion/core';

import { Container, Grid, Cell } from '@arch-ui/layout';
import { PageTitle } from '@arch-ui/typography';

import DocTitle from '@keystonejs/app-admin-ui/client/components/DocTitle'

import { HeaderInset } from '../components/HeaderInset'

const HelloPage = () => {
    return ( 
        <main>
            <DocTitle title="Hi Page" />
            <Container>
                <HeaderInset>
                    <PageTitle>Hello</PageTitle>
                </HeaderInset>
                <Grid gap={16}>
                    <p>Hello there</p>
                </Grid>
            </Container>
        </main>        
    )   
}

export default HelloPage;