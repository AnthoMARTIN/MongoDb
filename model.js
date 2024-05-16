import { Schema, model } from "mongoose";
const schemaBalade = new Schema({

    identifiant : String,
    adresse : String,
    code_postal : String,
    parcours : {
        0 : String
    },

    url_image : String,
    copyright_image : Schema.Types.Mixed,
    legende : Schema.Types.Mixed,
    categorie : String,
    nom_poi : String,
    date_saisie : String,
    mot_cle : {
        0 : String,
        1 : String,
        2 : String,
        3 : String
    },
    ville : String,
    texte_intro : String,
    texte_description : String,
    url_site : Schema.Types.Mixed,
    fichier_image : {
        thumbnail : Boolean,
        filename : String,
        format : String,
        width : Number,
        mimetype : String,
        etag : String,
        id : String,
        last_synchronized  : String,
        color_summary  : Array,
        height : Number

    },
    geo_shape : {
        type : String,
        geometry : {
            coordinates :  {
                0 : Number,
                1 : Number
            },

            type : String
        },

        properties : Object,
    },
    geo_point_2d : {
        lon : Number,
        lat : Number
    }

    })


    const Balade = model('Balades', schemaBalade , 'Balades' )
    export default Balade;