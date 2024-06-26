interface LoginDisplayProps{
    emailInput: string;
    setEmailInput: (email: string) => void;

    passwordInput: string;
    setPasswordInput: (password: string) => void;

    sendLoginRequest: () => void;
}

function LoginDisplay(props: LoginDisplayProps) {
    return(
        <div className="form-block">
            <h1>Login</h1>
            <input placeholder="Email" type="text" value={props.emailInput} onChange={(e) => {
                const email = e.target.value;
                if (email.includes(' ')) {
                    return
                }
                props.setEmailInput(email);
            }} onKeyDown={(e) => {
                if (e.key === "Enter")
                    props.sendLoginRequest();
            }}/>
            <hr/>
            <input placeholder="Password" type="password" value={props.passwordInput} onChange={(e) => {
                const password = e.target.value;
                if (password.includes(' ')) {
                    return
                }
                props.setPasswordInput(password);
            }} onKeyDown={(e) => {
                if (e.key === "Enter")
                    props.sendLoginRequest();
            }}/>
            <hr/>
            <button onClick={() => {
                props.sendLoginRequest()
            }}
            >Login
            </button>
        </div>
    )
}

export default LoginDisplay