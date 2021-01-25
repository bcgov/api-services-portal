import * as React from 'react';

import { ArrowForwardIcon } from '@chakra-ui/icons'

import {
    Box,
    Button,
    Divider,
    HStack,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    SimpleGrid,
    VStack
  } from "@chakra-ui/react"

function WalkthroughPopover(summary = { title: "", sector: "", license_title: "", notes: "" }) {
    const initialFocusRef = React.useRef()
    return (
      <Popover
        initialFocusRef={initialFocusRef}
        placement="bottom"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <Button>BC Data Catalog<ArrowForwardIcon/></Button>
        </PopoverTrigger>
        <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
          <PopoverHeader pt={10} fontWeight="bold" border="0">
            {summary.title}
          </PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            {summary.notes.length > 175 ? summary.notes.substring(0,175) + "..." : summary.notes}
            <Divider/>
            <SimpleGrid columns={2}>
                {[{l:'Sector',f:'sector'},{l:'License',f:'license_title'}].map(rec => (
                    <>
                        <div>{rec.l}</div>
                        <div>{summary[rec.f]}</div>
                    </>
                ))}
            </SimpleGrid>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    )
  }

export default WalkthroughPopover