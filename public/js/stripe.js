/* eslint-disable */

const hideAlert3 = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

  // type is 'success' or 'error'
const showAlert3 = (type, msg) => {
    hideAlert3();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};


const stripe = Stripe('pk_test_51LQjvIKpdt3hFceMVZsjyKANDyP7hQyxsDDnPRLBIHiGHC89d3KcOqk67qWl7NB4bQ0NkdkdTQrf7woAEoPH4jrM00TjC0dtYZ');

const bookTour = async tourId => {
    try {
        // 1) Get checkout session from API
        const session = await axios(
            `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
        );
        
        console.log(session);

        // 2) Create checkout form + chanre credit card
        await stripe.redirectToCheckout({
        sessionId: session.data.session.id
        });
        
    } catch (err) {
        console.log(err);
        showAlert3('error', err);
    }
};

const bookBtn = document.getElementById('book-tour');
if (bookBtn)
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
});
