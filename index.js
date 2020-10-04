const autoCompleteConfig = {
    renderOption(movie) {
        const imgSrc = movie.Poster === 'N/A' ? "" : movie.Poster;
        return `
        <img src="${imgSrc}"/>
        ${movie.Title}  <b>(${movie.Year})</b>
        `;
    },
    inputValue(movie) {
        return movie.Title;
    },
    async fetchData(searchTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'c1b76030',
                s: searchTerm
            }
        })
        if (response.data.Error) {
            return [];
        }
        return response.data.Search;
    }
}

createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
    }
});

createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
    }
});

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, board, side) => {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: 'c1b76030',
            i: movie.imdbID,
        }
    })
    board.innerHTML = movieTemplate(response.data);
    if (side === 'left') {
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    }
    if (leftMovie && rightMovie) {
        onComparison();
    }
}

const onComparison = () => {
    const leftStats = document.querySelectorAll('#left-summary .notification');
    const rightStats = document.querySelectorAll('#right-summary .notification');
    leftStats.forEach((leftS, idx) => {
        const rightS = rightStats[idx];

        const leftVal = parseInt(leftS.dataset.value);
        const rightVal = parseInt(rightS.dataset.value);
        if (rightVal > leftVal) {
            leftS.classList.remove('is-primary');
            leftS.classList.add('is-warning');
        } else {
            rightS.classList.remove('is-primary');
            rightS.classList.add('is-warning');
        }
    });
};

const movieTemplate = (movieDetail) => {

    const metaVal = parseInt(movieDetail.Metascore);
    const imdbRate = parseFloat(movieDetail.imdbRating);
    const imdbVote = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));

    const award = movieDetail.Awards.split(' ').reduce((prev, word) => {
        const value = parseInt(word);
        if (isNaN(value)) {
            return prev;
        } else {
            return prev + value;
        }
    }, 0);
    return `
        <article class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="${movieDetail.Poster}"/>
                </p>
            </figure>
            <div class="media-content">
                <div class="content">
                    <h1>${movieDetail.Title}</h1>
                    <h1>${movieDetail.Genre}</h1>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>
        </article>
        <article data-value=${award} class="notification is-primary">
            <p class="title">${movieDetail.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>
        
        <article data-value=${metaVal} class="notification is-primary">
            <p class="title">${movieDetail.Metascore}</p>
            <p class="subtitle">Metascore</p>
        </article>
        <article data-value=${imdbRate} class="notification is-primary">
            <p class="title">${movieDetail.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>
        <article data-value=${imdbVote} class="notification is-primary">
            <p class="title">${movieDetail.imdbVotes}</p>
            <p class="subtitle">IMDB Votes</p>
        </article>
    `
}