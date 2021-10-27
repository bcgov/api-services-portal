import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Icon,
  useEditableControls,
} from '@chakra-ui/react';
import { MdModeEditOutline } from 'react-icons/md';

interface ProfileNameControlProps {
  id: string;
  name: string;
}

const ProfileNameControl: React.FC<ProfileNameControlProps> = ({
  id,
  name,
}) => {
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();
    return (
      <Box ml={2}>
        {isEditing && (
          <ButtonGroup>
            <Button variant="secondary" size="sm" {...getCancelButtonProps()}>
              Cancel
            </Button>
            <Button size="sm" {...getSubmitButtonProps()}>
              Done
            </Button>
          </ButtonGroup>
        )}
        {!isEditing && (
          <Button
            variant="flat"
            px={2}
            size="sm"
            leftIcon={<Icon as={MdModeEditOutline} />}
            {...getEditButtonProps()}
          >
            Edit name
          </Button>
        )}
      </Box>
    );
  }
  return (
    <Editable
      d="flex"
      alignItems="center"
      defaultValue={name}
      isPreviewFocusable={false}
    >
      <EditablePreview />
      <EditableInput />
      <EditableControls />
    </Editable>
  );
};

export default ProfileNameControl;
