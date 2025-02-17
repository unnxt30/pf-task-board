import Button from '@mui/material/Button';
interface TaskProp {
    name: string;
    description: string;
    status: string;
}

export default function Task({ name }: TaskProp) {
    return <Button variant="contained">{name}</Button>;
}
