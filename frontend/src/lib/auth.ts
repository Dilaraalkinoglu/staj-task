export const TOKEN_KEY = "staj_task_token";

export function saveToken(token: string){
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(){
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(){
    localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(){
    return !!localStorage.getItem(TOKEN_KEY);
}