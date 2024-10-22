interface StatusMessage {
    [key:string]: string
}

interface ErrorMessage extends StatusMessage {
    error: string;
}