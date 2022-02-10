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
  onChange: (value: string) => void;
}

const ProfileNameControl: React.FC<ProfileNameControlProps> = ({
  name,
  onChange,
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
            <Button
              variant="secondary"
              size="sm"
              {...getCancelButtonProps()}
              data-testid="ap-profile-name-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              {...getSubmitButtonProps()}
              data-testid="ap-profile-name-done-btn"
            >
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
      onSubmit={onChange}
      submitOnBlur={false}
    >
      <EditablePreview />
      <EditableInput data-testid="ap-profile-name" />
      <EditableControls />
    </Editable>
  );
};

export default ProfileNameControl;
