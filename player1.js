let Parameters = {
    // Paramètres de la courbe de bézize définissans la vitesse de chute (aucune touche)
    // https://cubic-bezier.com
    X1: 1.0,
    Y1: 0.24,
    X2: 0.92,
    Y2: 0.53,

    // Vitesse linéaire de rétablissement (touche fléchée contraire au sens de la chute)
    RECOVERING_FACTOR: 1,

    // Vitesse linéaire de chute (touche fléchée identique au sens de la chute)
    FAILING_FAST_FACTOR: 2,

    // Durée initale de la chute
    BASE_DURATION: 5000,

    // Durée minimale de la chute
    MIN_DURATION: 500,

    // Facteur de réduction de la vitesse de chute (plus le temps passe, plus la chute est rapide)
    DECREASING_DURATION_FACTOR: 0.1,
};
