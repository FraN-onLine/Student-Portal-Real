document.addEventListener('DOMContentLoaded', () => {
    // Profile Picture Upload
    const changePictureBtn = document.getElementById('changePicture');
    const uploadPictureInput = document.getElementById('uploadPicture');
    const profilePicture = document.getElementById('profilePicture');

    changePictureBtn.addEventListener('click', () => uploadPictureInput.click());

    uploadPictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                profilePicture.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Subject Enrollment
    const subjectsList = document.getElementById('subjectsList');
    const enrolledSubjectsList = document.getElementById('enrolledSubjectsList');

    subjectsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('enrollBtn')) {
            const subject = e.target.getAttribute('data-subject');
            const enrolledItem = document.createElement('li');
            enrolledItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            enrolledItem.textContent = subject;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'btn btn-sm btn-danger';

            removeBtn.addEventListener('click', () => {
                enrolledSubjectsList.removeChild(enrolledItem);
            });

            enrolledItem.appendChild(removeBtn);
            enrolledSubjectsList.appendChild(enrolledItem);
        }
    });
});
