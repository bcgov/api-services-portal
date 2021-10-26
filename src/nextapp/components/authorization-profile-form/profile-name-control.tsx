import * as React from 'react';
import {
  Box,
  Button,
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
          <Button size="sm" {...getSubmitButtonProps()}>
            Save
          </Button>
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
      defaultValue="MoH Resource Server"
      isPreviewFocusable={false}
    >
      <EditablePreview />
      <EditableInput />
      <EditableControls />
    </Editable>
  );
};

export default ProfileNameControl;
