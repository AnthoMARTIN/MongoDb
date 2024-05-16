import { Router } from 'express';
import Balade from './model.js';

const router = Router();

// Route pour lister toutes les balades
router.get('/all', async (req, res) => {
    try {
        const balades = await Balade.find();
        res.json(balades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/", (req, res) => {
    res.json("bonjour");
});

router.get('/id/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const balades = await Balade.findById(id);

        if (!balades) {
            // Si aucune balade n'est trouvée, renvoie un message d'erreur
            return res.status(404).json({ message: "Balade introuvable" });
        }

        // Si une balade est trouvée, la renvoie en tant que réponse
        res.json(balades);
    } catch (error) {
        // En cas d'erreur, renvoie un message d'erreur avec le statut 500 (erreur interne du serveur)
        res.status(500).json({ message: error.message });
    }
});

router.get('/search/:search', async (req, res) => {
    const search = req.params.search;

    try {
        const balades = await Balade.find({
            $or: [
                { nom_poi: { $regex: search, $options: 'i' } }, // Recherche dans nom_poi, insensible à la casse
                { texte_intro: { $regex: search, $options: 'i' } } // Recherche dans texte_intro, insensible à la casse
            ]
        });

        if (balades.length === 0) {
            // Si aucune balade n'est trouvée, renvoie un message d'erreur
            return res.status(404).json({ message: "Aucune balade trouvée pour cette recherche" });
        }

        // Si des balades sont trouvées, les renvoie en tant que réponse
        res.json(balades);
    } catch (error) {
        // En cas d'erreur, renvoie un message d'erreur avec le statut 500 (erreur interne du serveur)
        res.status(500).json({ message: error.message });
    }
});

router.get('/site-internet', async (req, res) => {
    try {
        const balades = await Balade.find({ url_site: { $ne: null } });

        
        if (balades.length === 0) {
            return res.status(404).json({ message: "Aucune balade avec une URL de site Web trouvée" });
        }

        
        res.json(balades);
    } catch (error) {
        
        res.status(500).json({ message: error.message });
    }
});

router.get('/mot-cle', async (req, res) => {
    try {
        const balades = await Balade.find({ 'mot_cle.5': { $exists: true } });
        const count = await Balade.countDocuments({ 'mot_cle.5': { $exists: true } });
        res.json({ count, balades });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des balades.' });
    }
});

router.get('/publie/:annee', async (req, res) => {
    const annee = req.params.annee;

    try {
        
        const balades = await Balade.find({ date_saisie: { $regex: new RegExp(annee), $options: 'i' } })
                                    .sort({ date_saisie: 1 });

        
        if (balades.length === 0) {
            return res.status(404).json({ message: "Aucune balade publiée lors de cette année trouvée" });
        }

        
        res.json(balades);
    } catch (error) {
        
        res.status(500).json({ message: error.message });
    }
});

router.get('/arrondissement/:num_arrondissement', async (req, res) => {
    try {
        const numArrondissement = req.params.num_arrondissement;

        if (isNaN(numArrondissement) || numArrondissement.length !== 2) {
            return res.status(400).json({ error: 'Numéro d\'arrondissement invalide.' });
        }

        const regex = new RegExp(numArrondissement + '$');
        const count = await Balade.countDocuments({ code_postal: { $regex: regex } });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du comptage des balades.' });
    }
});

router.get('/synthese', async (req, res) => {
    try {
        const result = await Balade.aggregate([
            {
                $group: {
                    _id: { $substr: ["$code_postal", 3, 2] },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la synthèse par arrondissement.' });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Balade.distinct('categorie');
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories.' });
    }
});

router.post('/add', async (req, res) => {
    try {
        const { nom_poi, adresse, categorie, code_postal, parcours, url_image, copyright_image, legende, date_saisie, mot_cle, ville, texte_intro, texte_description, url_site, fichier_image, geo_shape, geo_point_2d } = req.body;

        if (!nom_poi || !adresse || !categorie) {
            return res.status(400).json({ error: 'Les champs nom_poi, adresse, et categorie sont obligatoires.' });
        }

        const nouvelleBalade = new Balade({
            nom_poi,
            adresse,
            categorie,
            code_postal,
            parcours,
            url_image,
            copyright_image,
            legende,
            date_saisie,
            mot_cle,
            ville,
            texte_intro,
            texte_description,
            url_site,
            fichier_image,
            geo_shape,
            geo_point_2d
        });

        await nouvelleBalade.save();
        res.status(201).json(nouvelleBalade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la nouvelle balade.' });
    }
});

router.put('/add-mot-cle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mot_cle } = req.body;

        if (!mot_cle) {
            return res.status(400).json({ error: 'Le mot clé est obligatoire.' });
        }

        const balades = await Balade.findById(id);

        if (!balades) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        if (balades.mot_cle.includes(mot_cle)) {
            return res.status(400).json({ error: 'Le mot clé existe déjà.' });
        }

        balades.mot_cle.push(mot_cle);
        await balades.save();

        res.status(200).json(balades);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout du mot clé.' });
    }
});

router.put('/update-one/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const miseAJour = req.body;

        const balades = await Balade.findByIdAndUpdate(id, miseAJour, { new: true });

        if (!balades) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json(balades);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la balade.' });
    }
});

router.put('/update-many/:search', async (req, res) => {
    try {
        const { search } = req.params;
        const { nom_poi } = req.body;

        if (!nom_poi) {
            return res.status(400).json({ error: 'Le nom_poi est obligatoire.' });
        }

        const regex = new RegExp(search, 'i'); 

        const balades = await Balade.updateMany({ texte_description: { $regex: regex } }, { nom_poi });

        if (balades.nModified === 0) {
            return res.status(404).json({ error: 'Aucune balade à mettre à jour.' });
        }

        res.status(200).json({ message: 'Balades mises à jour avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des balades.' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const balades = await Balade.findByIdAndDelete(id);

        if (!balades) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json({ message: 'Balade supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la balade.' });
    }
});

export default router;