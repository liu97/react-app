import 'whatwg-fetch';
import { createAction, handleActions } from 'redux-actions';
import Cookies from 'js-cookie';
import _ from 'lodash';
import md5 from 'md5';
import {message, Modal} from 'antd';