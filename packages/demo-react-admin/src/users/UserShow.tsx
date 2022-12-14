/* eslint react/jsx-key: off */
import * as React from 'react';
import {
    Show,
    Tab,
    TabbedShowLayout,
    TextField,
    usePermissions,
} from 'react-admin';

import Aside from './Aside';

const UserShow = () => {
    const { permissions } = usePermissions();
    return (
        <Show>
            <TabbedShowLayout>
                <Tab label="user.form.summary">
                    <TextField source="id" />
                    <TextField source="name" />
                </Tab>
                {permissions.includes('admin') && (
                    <Tab label="user.form.security" path="security">
                        <TextField source="role" />
                    </Tab>
                )}
            </TabbedShowLayout>
            <Aside />
        </Show>
    );
};

export default UserShow;
