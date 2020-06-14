$(document).ready(() => {
  // Getting references to our form and input
  const updateForm = $("form.account");
  const emailInput = $("input#email-input");
  const passwordInput = $("input#password-input");
  const fName = $("input#fname");
  const lName = $("input#lname");

  // When the signup button is clicked, we validate the email and password are not blank
  updateForm.on("submit", event => {
    event.preventDefault();
    const userData = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim(),
      fname: fName.val().trim(),
      lname: lName.val().trim()
    };

    if (
      !userData.email ||
      !userData.password ||
      !userData.fname ||
      !userData.lname
    ) {
      return;
    }
    // If we have an email and password, run the updateUser function
    updateUser(
      userData.email,
      userData.password,
      userData.fname,
      userData.lname
    );
    emailInput.val("");
    passwordInput.val("");
    fName.val("");
    lName.val("");
  });

  const id = $(this).data("id");

  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function updateUser(email, password, fname, lname) {
    $.put("/update", {
      userId: id,
      email: email,
      password: password,
      firstName: fname,
      lastName: lname
    })
      .then(() => {
        //add if condition for err
        window.location.replace("/portfolio");
        // If there's an error, handle it by throwing up a bootstrap alert
      })
      .catch(handleLoginErr);
  }

  function handleLoginErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  }
});