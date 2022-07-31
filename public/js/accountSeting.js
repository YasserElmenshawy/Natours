/* eslint-disable */

const hideAlert2 = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

  // type is 'success' or 'error'
const showAlert2 = (type, msg) => {
    hideAlert2();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};

// type is either 'password' or 'data'
const updateSettings = async (data, type) => {
    try {
        let url = ''
        if(type === 'password'){
            url = 'http://127.0.0.1:8000/api/v1/users/updatePassword';
        }else {
            url = 'http://127.0.0.1:8000/api/v1/users/updateMe';
        }
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data.status === 'success') {
        showAlert2('success', `${type.toUpperCase()} updated successfully!`);
        }
    } catch (err) {
        showAlert2('error', err.response.data.message);
    }
};


const userDataForm = document.querySelector('.form-user-data');

if(userDataForm){
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form,'data');
    });
};


const userPasswordForm = document.querySelector('.form-user-password');

if (userPasswordForm){
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';

        const PasswordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings(
            { PasswordCurrent, password, passwordConfirm },
            'password'
        );

        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
};