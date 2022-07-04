import * as React from 'react';
import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  Td,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import has from 'lodash/has';
import type { ServiceAccess, AccessRequest } from '@/shared/types/query.types';

import AccessStatus from './access-status';
import GenerateCredentialsDialog from '../access-request-form/generate-credentials-dialog';
import RegenerateCredentialsDialog from '../access-request-form/regenerate-credentials-dialog';
import { IoEllipsisHorizontal } from 'react-icons/io5';

interface AccessListRowProps {
  data: AccessRequest & ServiceAccess;
  index: number;
  onRevoke: (id: string, isRequest: boolean) => void;
}

const AccessListRow: React.FC<AccessListRowProps> = ({
  data,
  index,
  onRevoke,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const handleRevoke = React.useCallback(
    (id, isRequest) => async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      onRevoke(id, isRequest);
    },
    [onRevoke]
  );

  return (
    <Tr>
      <Td>
        <AccessStatus
          isIssued={data.isIssued ?? data.active === false}
          isComplete={data.isComplete ?? data.active === false}
          isApproved={data.isApproved ?? data.active}
        />
      </Td>
      <Td>
        <Tag
          colorScheme={data.productEnvironment?.name}
          variant="outline"
          textTransform="capitalize"
        >
          {data.productEnvironment?.name}
        </Tag>
      </Td>
      <Td>{data.application?.name}</Td>
      <Td isNumeric data-testid={`access-generate-credentials-${index}`}>
        {(has(data, 'isApproved') ||
          has(data, 'isIssued') ||
          has(data, 'isComplete')) &&
          (!data.isIssued || !data.isApproved) && (
            <GenerateCredentialsDialog id={data.id} />
          )}
        <RegenerateCredentialsDialog
          id={data.id}
          isOpen={isOpen}
          onClose={onClose}
        />
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="product actions"
            icon={<Icon as={IoEllipsisHorizontal} />}
            color="bc-blue"
            variant="ghost"
          />
          <MenuList>
            {[
              'kong-api-key-only',
              'kong-api-key-acl',
              'client-credentials',
            ].includes(data.productEnvironment.flow) && (
              <MenuItem data-testid="regenerate-credentials-btn" onClick={onOpen}>Regenerate Credentials</MenuItem>
            )}
            <MenuItem
              color="bc-error"
              onClick={handleRevoke(data.id, has(data, 'isIssued'))}
            >
              {data.active === false ? 'Cancel Request' : 'Revoke Access'}
            </MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};

export default AccessListRow;
