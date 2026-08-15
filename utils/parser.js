'use strict';

class Parser {

    static parse(text) {

        if (!text)
            throw new Error('Boş cevap');

        text = String(text)
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        const firstArray = text.indexOf('[');
        const lastArray = text.lastIndexOf(']');

        if (firstArray !== -1 && lastArray !== -1) {

            text = text.substring(firstArray, lastArray + 1);

        }

        let data;

        try {

            data = JSON.parse(text);

        } catch {

            throw new Error('AI geçerli JSON döndürmedi.');

        }

        if (!Array.isArray(data))
            throw new Error('JSON dizi değil.');

        for (const file of data) {

            if (typeof file !== 'object')
                throw new Error('Geçersiz dosya.');

            if (typeof file.file !== 'string')
                throw new Error('Dosya adı eksik.');

            if (typeof file.code !== 'string')
                throw new Error('Kod eksik.');

        }

        return data;

    }

}

module.exports = Parser;
