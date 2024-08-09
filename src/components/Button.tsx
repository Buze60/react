interface Props{
    Children:string;
    onClick:() =>void;
    color?:'primary' | 'secondary' | 'danger';
}
const Button = ({children,onClick,color="primary"}:Props) => {
  return (
    <div className={'btn btn-'+color} onClick={onClick}>{children}</div>
  )
}

export default Button