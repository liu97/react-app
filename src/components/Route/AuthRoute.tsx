import React, { SFC } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { Location } from 'history';
import Cookies from 'js-cookie'
import { TOKEN_NAME } from '@/global';

interface IObj {
    [key: string]: any
}

/**
 * 返回值  1：有权限访问， 2：无权限访问， 0：未登录
 */
const authCheck = ( location: Location ): 1 | 2 | 0 => {
    if(!Cookies.get(TOKEN_NAME)){
        return 0;
    }else{
        return 1;
    }
}

const AuthRoute: SFC<RouteProps & IObj> = function ({ children, ...rest }) {
    return (
        <Route
            {...rest}
            render={({ location }) => {
                let checkResult = authCheck(location);
                switch (checkResult) {
                    case 1:
                        return (
                            children
                        );
                    case 2:
                        return (
                            <Redirect
                                to={{
                                    pathname: "/",
                                    state: { from: location }
                                }}
                            />
                        );
                    case 0:
                        (
                            <Redirect
                                to={{
                                    pathname: "/login",
                                    state: { from: location }
                                }}
                            />
                        );
                }
            }
            }

        />
    );
}

export default AuthRoute;