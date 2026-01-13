// import { useState } from 'react';
// import {
//   Button,
//   Dropdown,
//   DropdownList,
//   DropdownItem,
//   MenuToggle,
//   MenuToggleElement,
//   Modal,
//   ModalBody,
//   ModalHeader,
//   ModalFooter,
//   ModalVariant,
// } from '@patternfly/react-core';
// import { useTranslation } from 'react-i18next';

// import { Form, FormGroup, TextInput } from '@patternfly/react-core';
// import { usePerses } from './hooks/usePerses';

// const onFocus = () => {
//   const element = document.getElementById('modal-dropdown-toggle');
//   (element as HTMLElement).focus();
// };

// export const FormBasic: React.FunctionComponent = () => {
//   const [phone, setPhone] = useState('');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const { persesProjects } = usePerses();
//   const [selectedValue, setSelectedValue] = useState<string>('');

//   console.log('!JZ ', { persesProjects });

//   // const dropdownOptions = () => {
//   //   const options = [];
//   //   for (const project of persesProjects) {
//   //     options.push(<DropdownItem> {project.metadata.name} </DropdownItem>);
//   //   }
//   //   return options;
//   // };

//   const handlePhoneChange = (_event, phone: string) => {
//     setPhone(phone);
//   };

//   const handleDropdownToggle = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const onSelect = (event: React.MouseEvent<Element, MouseEvent> | undefined, value: string) => {
//     console.log('Selected value:', value);
//     setSelectedValue(value);
//     setIsDropdownOpen(false);
//     onFocus();
//   };

//   return (
//     <Form>
//       <FormGroup label="Select project" isRequired fieldId="simple-form-email-01">
//         <Dropdown
//           isOpen={isDropdownOpen}
//           onSelect={onSelect}
//           onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
//           toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
//             <MenuToggle ref={toggleRef} onClick={handleDropdownToggle} isExpanded={isDropdownOpen}>
//               Dropdown
//             </MenuToggle>
//           )}
//         >
//           <DropdownList>
//             {persesProjects.map((project, i) => (
//               <DropdownItem
//                 value={`${project.metadata.name}`}
//                 key={`${i}-${project.metadata.name}`}
//               >
//                 {project.metadata.name}
//               </DropdownItem>
//             ))}
//             {/* <DropdownItem value={0} key="action">
//               Action
//             </DropdownItem>
//             <DropdownItem
//               value={1}
//               key="link"
//               to="#default-link2"
//               // Prevent the default onClick functionality for example purposes
//               onClick={(ev: any) => ev.preventDefault()}
//             >
//               Link
//             </DropdownItem>
//             <DropdownItem value={2} isDisabled key="disabled action">
//               Disabled Action
//             </DropdownItem>
//             <DropdownItem value={3} isDisabled key="disabled link" to="#default-link4">
//               Disabled Link
//             </DropdownItem> */}
//           </DropdownList>
//         </Dropdown>
//       </FormGroup>
//       <FormGroup label="Dashboard name" isRequired fieldId="simple-form-phone-01">
//         <TextInput
//           isRequired
//           type="text"
//           id="simple-form-phone-01"
//           name="simple-form-phone-01"
//           placeholder="555-555-5555"
//           value={phone}
//           onChange={handlePhoneChange}
//         />
//       </FormGroup>
//     </Form>
//   );
// };

// export const ModalWithDropdown: React.FunctionComponent = () => {
//   const { t } = useTranslation(process.env.I18N_NAMESPACE);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const handleModalToggle = () => {
//     setIsModalOpen(!isModalOpen);
//     setIsDropdownOpen(false);
//   };

//   const onEscapePress = () => {
//     if (isDropdownOpen) {
//       setIsDropdownOpen(!isDropdownOpen);
//       onFocus();
//     } else {
//       handleModalToggle();
//     }
//   };

//   return (
//     <>
//       <Button variant="primary" onClick={handleModalToggle}>
//         {t('Create')}
//       </Button>
//       <Modal
//         variant={ModalVariant.small}
//         isOpen={isModalOpen}
//         onClose={handleModalToggle}
//         onEscapePress={onEscapePress}
//         aria-labelledby="modal-with-dropdown"
//         aria-describedby="modal-box-body-with-dropdown"
//       >
//         <ModalHeader
//           title={t('Create dashboard')}
//           labelId="dashboard-list-create-dashboard-dialog-header"
//         />
//         <ModalBody id="dashboard-list-create-dashboard-dialog-body">
//           <FormBasic />
//         </ModalBody>
//         <ModalFooter>
//           <Button key="confirm" variant="primary" onClick={handleModalToggle}>
//             Save
//           </Button>
//           <Button key="cancel" variant="link" onClick={handleModalToggle}>
//             Cancel
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </>
//   );
// };

import { Fragment, useState } from 'react';
import {
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalVariant,
  FormGroup,
  Form,
  TextInput,
} from '@patternfly/react-core';
import { usePerses } from './hooks/usePerses';
import { useTranslation } from 'react-i18next';

export const DashboardCreateDialog: React.FunctionComponent = () => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  const { persesProjects } = usePerses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number | null>(null);
  const [dashboardName, setDashboardName] = useState<string>('');

  const handleSetDashboardName = (_event, dashboardName: string) => {
    setDashboardName(dashboardName);
  };

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsModalOpen(!isModalOpen);
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('modal-dropdown-toggle');
    (element as HTMLElement)?.focus();
  };

  const onEscapePress = (event: KeyboardEvent) => {
    if (isDropdownOpen) {
      setIsDropdownOpen(!isDropdownOpen);
      onFocus();
    } else {
      handleModalToggle(event);
    }
  };

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    setSelectedValue(value || null);
    setIsDropdownOpen(false);
    onFocus();

    // Do something with the selected value
    handleSelection(value);
  };

  const handleSelection = (value: string | number | undefined) => {
    switch (value) {
      case 0:
        console.log('Action selected');
        break;
      case 1:
        console.log('Link selected');
        break;
      // Add your logic here
    }
  };

  return (
    <Fragment>
      <Button variant="primary" onClick={handleModalToggle}>
        Create Dashboard
      </Button>
      <Modal
        variant={ModalVariant.small}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        onEscapePress={onEscapePress}
        aria-labelledby="modal-with-dropdown"
      >
        <ModalHeader title="Create Dashboard" />

        <ModalBody>
          <Form>
            <FormGroup
              label="Select project"
              isRequired
              fieldId="form-group-create-dashboard-dialog-project-selection"
            >
              <Dropdown
                isOpen={isDropdownOpen}
                onSelect={onSelect} // This now captures the value
                onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={handleDropdownToggle}
                    isExpanded={isDropdownOpen}
                    isFullWidth
                  >
                    {selectedValue !== null ? `Selected: ${selectedValue}` : 'Select an option'}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {persesProjects.map((project, i) => (
                    <DropdownItem
                      value={`${project.metadata.name}`}
                      key={`${i}-${project.metadata.name}`}
                    >
                      {project.metadata.name}
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>
            </FormGroup>
            <FormGroup
              label="Dashboard name"
              isRequired
              fieldId="form-group-create-dashboard-dialog-name"
            >
              <TextInput
                isRequired
                type="text"
                id="text-input-create-dashboard-dialog-name"
                name="text-input-create-dashboard-dialog-name"
                placeholder={t('my-new-dashboard')}
                value={dashboardName}
                onChange={handleSetDashboardName}
              />
            </FormGroup>
          </Form>

          {selectedValue && (
            <div style={{ marginTop: '16px' }}>
              Selected: <strong>{selectedValue}</strong>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            key="create"
            variant="primary"
            onClick={handleModalToggle}
            isDisabled={!selectedValue}
          >
            Create
          </Button>
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};
