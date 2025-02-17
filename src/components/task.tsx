import Button from '@mui/material/Button';
import * as React from 'react';

interface TaskProp {
    name: string;
    description: string;
    status: string;
}

export default function Task({ name, description, status }: TaskProp) {
    return <Button variant="contained">{name}</Button>;
}
